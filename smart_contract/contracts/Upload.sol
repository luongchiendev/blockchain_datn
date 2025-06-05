// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract Upload {
    struct Access {
        address user;
        bool access;
    }

    struct FileData {
        string ipfsLink;
        uint256 uploadTime;
        string fileName;
        bytes32 fileHash;
        string signature;
    }

    mapping(address => FileData[]) private files;
    mapping(address => mapping(address => bool)) public ownership;
    mapping(address => Access[]) private accessList;
    mapping(address => mapping(address => bool)) private previousData;

    // Thêm một file có thêm chữ ký, hash và transactionHash
    function add(
        address _user,
        string memory url,
        string memory fileName,
        bytes32 fileHash,
        string memory signature
    ) external {
        require(_user == msg.sender || ownership[_user][msg.sender], "Not authorized");

        files[_user].push(FileData({
            ipfsLink: url,
            uploadTime: block.timestamp,
            fileName: fileName,
            fileHash: fileHash,
            signature: signature
        }));
    }

    // Thêm nhiều file có thêm hash, signature và transactionHash
    function addMultiple(
        address _user,
        string[] memory urls,
        string[] memory fileNames,
        bytes32[] memory fileHashes,
        string[] memory signatures
    ) external {
        require(_user == msg.sender || ownership[_user][msg.sender], "Not authorized");
        require(
            urls.length == fileNames.length &&
            urls.length == fileHashes.length &&
            urls.length == signatures.length,
            "Mismatched array lengths"
        );

        for (uint i = 0; i < urls.length; i++) {
            files[_user].push(FileData({
                ipfsLink: urls[i],
                uploadTime: block.timestamp,
                fileName: fileNames[i],
                fileHash: fileHashes[i],
                signature: signatures[i]
            }));
        }
    }

    function allow(address user) external {
        ownership[msg.sender][user] = true;
        if (previousData[msg.sender][user]) {
            for (uint i = 0; i < accessList[msg.sender].length; i++) {
                if (accessList[msg.sender][i].user == user) {
                    accessList[msg.sender][i].access = true;
                }
            }
        } else {
            accessList[msg.sender].push(Access(user, true));
            previousData[msg.sender][user] = true;
        }
    }

    function disallow(address user) public {
        ownership[msg.sender][user] = false;
        for (uint i = 0; i < accessList[msg.sender].length; i++) {
            if (accessList[msg.sender][i].user == user) {
                accessList[msg.sender][i].access = false;
            }
        }
    }

    function display(address _user) external view returns (string[] memory) {
        require(_user == msg.sender || ownership[_user][msg.sender], "You don't have access");

        uint length = files[_user].length;
        string[] memory links = new string[](length);
        for (uint i = 0; i < length; i++) {
            links[i] = files[_user][i].ipfsLink;
        }
        return links;
    }

   function displayDetailed(address _user) external view returns (
    string[] memory, 
    uint256[] memory, 
    string[] memory,
    bytes32[] memory,
    string[] memory
) {
    require(_user == msg.sender || ownership[_user][msg.sender], "You don't have access");

    uint length = files[_user].length;
    string[] memory links = new string[](length);
    uint256[] memory timestamps = new uint256[](length);
    string[] memory names = new string[](length);
    bytes32[] memory hashes = new bytes32[](length);
    string[] memory signatures = new string[](length);

    for (uint i = 0; i < length; i++) {
        links[i] = files[_user][i].ipfsLink;
        timestamps[i] = files[_user][i].uploadTime;
        names[i] = files[_user][i].fileName;
        hashes[i] = files[_user][i].fileHash;
        signatures[i] = files[_user][i].signature;
    }

    return (links, timestamps, names, hashes, signatures);
}




    function shareAccess() public view returns (Access[] memory) {
        return accessList[msg.sender];
    }
}
