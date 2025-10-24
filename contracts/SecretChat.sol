// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title SecretChat
/// @notice Enables private messaging backed by FHE-encrypted symmetric keys.
contract SecretChat is SepoliaConfig {
    struct Message {
        address sender;
        address recipient;
        string senderUsername;
        string recipientUsername;
        string ciphertext;
        euint32 encryptedKey;
        uint256 timestamp;
    }

    mapping(address => string) private _usernames;
    mapping(bytes32 => address) private _usernameToAddress;
    Message[] private _messages;
    mapping(address => uint256[]) private _inboxMessageIds;
    mapping(address => uint256[]) private _outboxMessageIds;

    event UserRegistered(address indexed user, string username);
    event MessageSent(
        uint256 indexed messageId,
        address indexed sender,
        address indexed recipient,
        string recipientUsername
    );

    /// @notice Registers or updates the caller username.
    /// @param username The desired username.
    function registerUsername(string calldata username) external {
        bytes memory usernameBytes = bytes(username);
        require(usernameBytes.length > 0, "Empty username");
        require(usernameBytes.length <= 64, "Username too long");

        address sender = msg.sender;

        bytes32 usernameKey = keccak256(usernameBytes);
        address currentOwner = _usernameToAddress[usernameKey];
        require(currentOwner == address(0) || currentOwner == sender, "Username unavailable");

        string memory previousUsername = _usernames[sender];
        if (bytes(previousUsername).length > 0) {
            bytes32 previousKey = keccak256(bytes(previousUsername));
            if (_usernameToAddress[previousKey] == sender) {
                delete _usernameToAddress[previousKey];
            }
        }

        _usernameToAddress[usernameKey] = sender;
        _usernames[sender] = username;

        emit UserRegistered(sender, username);
    }

    /// @notice Resolves a username into an address.
    /// @param username The username to resolve.
    /// @return The owner address of the username if registered.
    function resolveUsername(string calldata username) external view returns (address) {
        bytes32 usernameKey = keccak256(bytes(username));
        return _usernameToAddress[usernameKey];
    }

    /// @notice Returns the registered username for an account.
    /// @param account The account to query.
    /// @return The username string if present.
    function getUsername(address account) external view returns (string memory) {
        return _usernames[account];
    }

    /// @notice Sends an encrypted message.
    /// @param recipientUsername The optional username of the recipient.
    /// @param recipientAddress The optional direct address of the recipient.
    /// @param ciphertext The encrypted message payload.
    /// @param encryptedKey The encrypted symmetric key.
    /// @param encryptedKeyProof The input proof for the encrypted key.
    /// @return messageId The identifier of the stored message.
    function sendMessage(
        string calldata recipientUsername,
        address recipientAddress,
        string calldata ciphertext,
        externalEuint32 encryptedKey,
        bytes calldata encryptedKeyProof
    ) external returns (uint256 messageId) {
        require(bytes(ciphertext).length > 0, "Empty ciphertext");

        address sender = msg.sender;
        require(bytes(_usernames[sender]).length > 0, "Sender not registered");

        address resolvedRecipient = _resolveRecipient(recipientUsername, recipientAddress);
        require(resolvedRecipient != address(0), "Recipient not found");
        require(resolvedRecipient != sender, "Cannot message self");

        euint32 fheKey = FHE.fromExternal(encryptedKey, encryptedKeyProof);

        FHE.allowThis(fheKey);
        FHE.allow(fheKey, resolvedRecipient);
        FHE.allow(fheKey, sender);

        string memory storedRecipientUsername = _usernames[resolvedRecipient];
        if (bytes(storedRecipientUsername).length == 0 && bytes(recipientUsername).length > 0) {
            storedRecipientUsername = recipientUsername;
        }

        Message memory newMessage = Message({
            sender: sender,
            recipient: resolvedRecipient,
            senderUsername: _usernames[sender],
            recipientUsername: storedRecipientUsername,
            ciphertext: ciphertext,
            encryptedKey: fheKey,
            timestamp: block.timestamp
        });

        _messages.push(newMessage);
        messageId = _messages.length - 1;

        _inboxMessageIds[resolvedRecipient].push(messageId);
        _outboxMessageIds[sender].push(messageId);

        emit MessageSent(messageId, sender, resolvedRecipient, storedRecipientUsername);
    }

    /// @notice Returns the inbox message identifiers for a user.
    /// @param account The account to query.
    /// @return The list of message identifiers.
    function getInboxIds(address account) external view returns (uint256[] memory) {
        return _inboxMessageIds[account];
    }

    /// @notice Returns the outbox message identifiers for a user.
    /// @param account The account to query.
    /// @return The list of message identifiers.
    function getOutboxIds(address account) external view returns (uint256[] memory) {
        return _outboxMessageIds[account];
    }

    /// @notice Returns message metadata without the encrypted key.
    /// @param messageId The identifier of the message.
    /// @return sender The sender address.
    /// @return senderUsername The sender username.
    /// @return recipient The recipient address.
    /// @return recipientUsername The recipient username if known.
    /// @return ciphertext The encrypted message payload.
    /// @return timestamp The block timestamp when stored.
    function getMessageMetadata(uint256 messageId)
        external
        view
        returns (
            address sender,
            string memory senderUsername,
            address recipient,
            string memory recipientUsername,
            string memory ciphertext,
            uint256 timestamp
        )
    {
        require(messageId < _messages.length, "Invalid message");
        Message storage messageRef = _messages[messageId];
        return (
            messageRef.sender,
            messageRef.senderUsername,
            messageRef.recipient,
            messageRef.recipientUsername,
            messageRef.ciphertext,
            messageRef.timestamp
        );
    }

    /// @notice Returns the encrypted symmetric key for a message.
    /// @param messageId The identifier of the message.
    /// @return The encrypted key as an euint32.
    function getEncryptedKey(uint256 messageId) external view returns (euint32) {
        require(messageId < _messages.length, "Invalid message");
        return _messages[messageId].encryptedKey;
    }

    /// @notice Returns the number of stored messages.
    function getTotalMessages() external view returns (uint256) {
        return _messages.length;
    }

    function _resolveRecipient(string calldata username, address account) private view returns (address) {
        bool hasUsername = bytes(username).length > 0;

        if (account != address(0)) {
            if (hasUsername) {
                address usernameOwner = _usernameToAddress[keccak256(bytes(username))];
                require(usernameOwner != address(0), "Unknown username");
                require(usernameOwner == account, "Recipient mismatch");
            }
            return account;
        }

        if (hasUsername) {
            address usernameOwner = _usernameToAddress[keccak256(bytes(username))];
            require(usernameOwner != address(0), "Unknown username");
            return usernameOwner;
        }

        return address(0);
    }
}
