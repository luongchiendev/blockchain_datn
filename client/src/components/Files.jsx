import { useState } from "react";
import { ethers } from "ethers";
import './Files.css';
import { FaFileExcel, FaFileWord, FaFilePdf } from "react-icons/fa";
import { FileText } from "lucide-react";

export default function Files({ contract, account, shared, title }) {
  const [groupedFiles, setGroupedFiles] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null); // null | true | false
  const [verifying, setVerifying] = useState(false);

  const formatDateGroup = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const today = new Date();
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return "Today";
    }
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric"
    });
  };

  const openModal = (file) => {
    setSelectedFile(file);
    setVerifyResult(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFile(null);
    setVerifyResult(null);
    setVerifying(false);
  };

  const getFileIcon = (fileUrl) => {
    const ext = fileUrl.split('.').pop().toLowerCase();

    if (["png", "jpg", "jpeg", "gif", "bmp", "webp"].includes(ext)) {
      return <img src={fileUrl} alt="preview" className="h-32 w-32 file-icon object-cover mx-auto mb-1 rounded" />;
    }
    if (["xls", "xlsx", "csv"].includes(ext)) {
      return <FaFileExcel className="mx-auto file-icon h-32 w-32 text-green-600 mb-1" />;
    }
    if (["doc", "docx"].includes(ext)) {
      return <FaFileWord className="mx-auto file-icon h-32 w-32 text-blue-600 mb-1" />;
    }
    if (["pdf"].includes(ext)) {
      return <FaFilePdf className="mx-auto file-icon h-32 w-32 text-red-600 mb-1" />;
    }
    return <FileText className="mx-auto file-icon h-32 w-32 text-gray-500 mb-1" />;
  };

  const GetAllFiles = async () => {
    const Otheraddress = document.querySelector(".address")?.value;
    try {
      const user = shared ? Otheraddress : account;

      if (shared && !Otheraddress) {
        alert("Enter the address");
        return;
      }

      // Lấy dữ liệu từ smart contract
      const [urls, timestamps, fileName, keccakHashes] = await contract.displayDetailed(user);
      // keccakHashes giả định là mảng lưu hash keccak file trên blockchain (cần smart contract hỗ trợ)

      const storedHashes = JSON.parse(localStorage.getItem("signedFiles") || "[]");

      const filesByDate = {};

      for (let i = 0; i < urls.length; i++) {
        const group = formatDateGroup(timestamps[i].toNumber());
        const matchedHash = storedHashes.find(
          (entry) => entry.ipfs === urls[i]
        );
        if (!filesByDate[group]) filesByDate[group] = [];
        filesByDate[group].push({
          url: urls[i],
          timestamp: timestamps[i].toNumber(),
          fileName: fileName[i],
          txHash: matchedHash?.txHash || null,
          keccakHash: keccakHashes ? keccakHashes[i] : null // Lưu hash keccak ở đây
        });
      }

      setGroupedFiles(filesByDate);
    } catch (e) {
      alert("You don't have access");
      setGroupedFiles({});
    }
  };

  // Hàm tính keccak256 hash file
  const calculateKeccak256 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          const bytes = new Uint8Array(reader.result);
          const hash = ethers.utils.keccak256(bytes);
          resolve(hash);
        } else {
          reject(new Error("Unexpected file read result"));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  };

  // Xác minh file được chọn
  const verifyFile = async (e) => {
    if (!selectedFile) return;
    const file = e.target.files[0];
    if (!file) return;

    setVerifying(true);
    setVerifyResult(null);

    try {
      const fileHash = await calculateKeccak256(file);
      const isValid = fileHash === selectedFile.keccakHash;
      setVerifyResult(isValid);
    } catch (error) {
      alert("Error verifying file: " + error.message);
      setVerifyResult(false);
    }
    setVerifying(false);
  };

  return (
    <>
      <div className="text-3xl text-black border-bottom-1 flex">
        {title}
        <div className="grid grid-cols-5 w-2/3 gap-1 left mb-10 ml-10">
          {shared ? (
            <>
              <button className="bg-btn text-white p-2 w-full col-span-1 hover:bg-green-700" onClick={GetAllFiles}>
                Load Files
              </button>
              <input
                type="text"
                placeholder="Enter Others Address"
                className="address bg-btn w-full col-span-2"
              />
            </>
          ) : (
            <button className="bg-btn text-white hover:bg-green-700 p-2 w-48" onClick={GetAllFiles}>
              Load Files
            </button>
          )}
        </div>
      </div>

      {Object.keys(groupedFiles).sort((a, b) => {
        const aTime = groupedFiles[a][0]?.timestamp || 0;
        const bTime = groupedFiles[b][0]?.timestamp || 0;
        return bTime - aTime;
      }).map((dateGroup) => (
        <div key={dateGroup} className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">{dateGroup}</h2>
          <div className="w-full h-px bg-gray-300 mb-5"></div>
          <ul className="divide-y divide-white grid grid-cols-1 md:grid-cols-8 gap-5">
            {[...groupedFiles[dateGroup]]
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((file, index) => (
                <li key={index} className="flex justify-between gap-x-1 rounded-2xl">
                  <div
                    key={index}
                    className="relative w-52 h-64 text-center border rounded shadow hover:shadow-md transition file-card"
                  >
                    {getFileIcon(file.fileName)}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 break-words mb-1">
                        {file.fileName}
                      </p>
                      <p className="text-xs text-gray-500 mb-1">
                        Uploaded at: {new Date(file.timestamp * 1000).toLocaleString()}
                      </p>
                      <button
                        className="absolute btn-view py-1 px-5 bg-btn text-white border text-sm"
                        onClick={() => openModal(file)}
                      >
                        View
                      </button>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      ))}
      <div className="ending text-gray-500">
        <p>You reached the end of the list.</p>
      </div>

      {showModal && selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[400px]">
            <h2 className="text-lg text-black font-semibold mb-4">File Details</h2>

            <p className="text-sm text-black break-words mb-2">
              <strong>File:</strong> {selectedFile.fileName}
            </p>

            <p className="text-sm text-black break-words mb-2">
              <strong>IPFS URL:</strong>{" "}
              <a
                href={selectedFile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Download File
              </a>
            </p>

            {selectedFile.txHash && (
              <p className="text-sm text-black break-words mb-4">
                <strong>Transaction:</strong>{" "}
                <a
                  href={`https://sepolia.etherscan.io/tx/${selectedFile.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View on Etherscan
                </a>
              </p>
            )}

            {/* Input upload file để xác minh */}
            <div className="mb-4">
              <label className="block mb-1 font-semibold text-gray-700">Verify File:</label>
              <input type="file" onChange={verifyFile} disabled={verifying} />
            </div>

            {/* Hiển thị kết quả xác minh */}
            {verifyResult !== null && (
              <p className={`font-semibold ${verifyResult ? 'text-green-600' : 'text-red-600'}`}>
                {verifyResult ? "File is valid and matches the original." : "File does NOT match the original!"}
              </p>
            )}

            <button
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mt-4"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
