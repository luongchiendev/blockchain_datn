/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React from "react";

export default function UploadHistory({ uploadHistory }) {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4 text-black">Upload History</h2>
      {uploadHistory.length === 0 ? (
        <p className="text-gray-500">No uploads yet.</p>
      ) : (
        <ul className="space-y-4">
          {uploadHistory.map((file, index) => (
            <li
              key={index}
              className="bg-white text-black p-4 rounded shadow text-sm break-words border"
            >
              <div><strong>📄 File:</strong> {file.fileName}</div>
              <div><strong>📅 Time:</strong> {new Date(file.timestamp).toLocaleString()} </div>
              <div>
                <strong>🔗 IPFS:</strong>{" "}
                <a
                  href={file.ipfs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View File
                </a>
              </div>
              <div>
                <strong>🔐 Document Hash:</strong>{" "}
                <span className="font-mono text-xs">{file.hash}</span>
              </div>
              <div>
                <strong>✍️ Signature:</strong>{" "}
                <span className="font-mono text-xs">{file.signature}</span>
              </div>
              <div>
                <strong>🧾 Transaction:</strong>{" "}
                <a
                  href={`https://sepolia.etherscan.io/tx/${file.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  {file.txHash.slice(0, 10)}...
                </a>
              </div>
              {file.account && (
                <div>
                  <strong>👤 Signed by:</strong>{" "}
                  <span className="text-gray-700">{file.account}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
