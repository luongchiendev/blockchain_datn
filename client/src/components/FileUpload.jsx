/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useRef } from "react";
import axios from "axios";
import { API_Key, API_Secret } from "../utils/constants";
import { UploadCloud, FileText, Download, X } from "lucide-react";
import { FaFileExcel, FaFileWord, FaFilePdf } from "react-icons/fa";
import { Button } from "./ui/button";
import { keccak256 } from "ethers/lib/utils";

const FileUpload = ({ contract, account, setUploadHistory }) => {
  const [fileList, setFileList] = useState([]);
  const fileInputRef = useRef(null);

  const hashFile = async (file) => {
    const buffer = await file.arrayBuffer();
    return keccak256(new Uint8Array(buffer));
  };

  const signHash = async (hash) => {
    const signature = await window.ethereum.request({
      method: "personal_sign",
      params: [hash, account],
    });
    return signature;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (fileList.length === 0) return;

    try {
      const updatedFiles = [];
      const newUploadedFiles = [];

      for (const fileObj of fileList) {
        const file = fileObj.file;
        const fileName = file.name;

        const documentHash = await hashFile(file);
        const signature = await signHash(documentHash);

        const formData = new FormData();
        formData.append("file", file);

        const resFile = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            pinata_api_key: API_Key,
            pinata_secret_api_key: API_Secret,
            "Content-Type": "multipart/form-data",
          },
        });

        const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;

        const tx = await contract.add(
          account,
          ipfsUrl,
          fileName,
          documentHash,
          signature
        );
        await tx.wait();

        newUploadedFiles.push({
          fileName,
          ipfs: ipfsUrl,
          txHash: tx.hash,
          hash: documentHash,
          signature,
          timestamp: new Date(),
        });
  
        
        

        updatedFiles.push({
          ...fileObj,
          url: ipfsUrl,
          txHash: tx.hash,
        });

        // Lưu vào localStorage nếu muốn
        const existing = JSON.parse(localStorage.getItem("signedFiles") || "[]");
        localStorage.setItem(
          "signedFiles",
          JSON.stringify([
            ...existing,
            {
              fileName,
              ipfs: ipfsUrl,
              txHash: tx.hash,
              hash: documentHash,
              signature,
              timestamp: new Date(),
            },
          ])
        );
      }
      setUploadHistory(prev => [...newUploadedFiles, ...prev]);
      setFileList(updatedFiles);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi upload hoặc ký số");
    }
  };

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    const readFiles = fileArray.map((file) => {
      return new Promise((resolve) => {
        const reader = new window.FileReader();
        reader.readAsArrayBuffer(file);
        reader.onloadend = () => {
          resolve({
            file,
            name: file.name,
            size: (file.size / 1024).toFixed(2),
            url: null,
          });
        };
      });
    });

    Promise.all(readFiles).then((results) => {
      setFileList((prev) => [...prev, ...results]);
    });
  };

  const retrieveFile = (e) => {
    handleFiles(e.target.files);
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const removeFile = (index) => {
    setFileList((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (["png", "jpg", "jpeg", "gif", "bmp", "webp"].includes(ext)) {
      return <img src={URL.createObjectURL(file.file)} alt="preview" className="h-32 w-32 object-cover mx-auto mb-1 rounded" />;
    }
    if (["xls", "xlsx", "csv"].includes(ext)) {
      return <FaFileExcel className="mx-auto h-32 w-32 text-green-600 mb-1" />;
    }
    if (["doc", "docx"].includes(ext)) {
      return <FaFileWord className="mx-auto h-32 w-32 text-blue-600 mb-1" />;
    }
    if (["pdf"].includes(ext)) {
      return <FaFilePdf className="mx-auto h-32 w-32 text-red-600 mb-1" />;
    }
    return <FileText className="mx-auto h-32 w-32 text-gray-500 mb-1" />;
  };

  return (
    <div className="p-6">
      <form
        onSubmit={handleSubmit}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 bg border-dashed border-gray-300 rounded-xl p-6 bg-white flex flex-col items-center justify-center text-center mb-6"
      >
        <UploadCloud className="h-10 w-10 text-green-700 mb-2" />
        <p className="font-medium text-black">Drag and Drop file(s) here</p>
        <label
          htmlFor="file-upload"
          className="mt-2 bg-blue-600 bg-btn text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-green-700"
        >
          Or choose your file
        </label>
        <input
          disabled={!account}
          type="file"
          id="file-upload"
          name="data"
          onChange={retrieveFile}
          className="hidden"
          ref={fileInputRef}
          multiple
        />

        {fileList.length > 0 && (
          <div className="bg-white list-file rounded-xl p-4 shadow border mt-4">
            <h2 className="font-semibold text-lg mb-4">Files Ready for Signing</h2>
            <div className="flex flex-wrap gap-4">
              {fileList.map((f, index) => (
                <div
                  key={index}
                  className="relative w-52 h-64 text-center border p-2 rounded shadow hover:shadow-md"
                >
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {getFileIcon(f)}
                  <p className="text-sm text-gray-600 truncate" title={f.name}>{f.name}</p>
                  <p className="text-xs text-gray-500">{f.size}KB</p>
                  {/* {f.url && (
                    <a href={f.url} target="_blank" rel="noopener noreferrer">
                      <Download className="mx-auto mt-1 text-blue-600 hover:text-blue-800 cursor-pointer" />
                    </a>
                  )} */}
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={fileList.length === 0}
          className="mt-4 p-1 bg-btn bg-blue-600 text-white hover:bg-green-700"
        >
          Upload & Sign
        </Button>
      </form>
    </div>
  );
};

export default FileUpload;
