import React, { useState, useCallback } from "react";
import { Upload, File, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

export default function DocumentUploadBox() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const navigate = useNavigate();

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  }, []);

  const onFileChange = useCallback((e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  }, []);

  const uploadFile = useCallback(async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("https://documentq-a.onrender.com/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setUploadedFileUrl(data.url);
      // Show success toast
      toast.success("Document uploaded successfully!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      navigate("/chat", { state: { documentName: file.name } });
    } catch (error) {
      console.error("Error uploading file:", error);

      // Show error toast
      toast.error("Failed to upload document. Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setUploading(false);
    }
  }, [file, navigate]);

  const removeFile = useCallback(() => {
    setFile(null);
    setUploadedFileUrl(null);
  }, []);

  return (
    <div
      className={`w-full max-w-md mx-auto border-2 border-dashed rounded-lg p-16 text-center cursor-pointer transition-all ease-in-out ${
        isDragging
          ? "border-primary animate-pulse"
          : "border-gray-300 hover:border-primary"
      } bg-transparent`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        type="file"
        onChange={onFileChange}
        className="hidden"
        id="file-upload"
        accept=".pdf,.doc,.docx,.txt"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="flex flex-col items-center justify-center">
          {!file && (
            <>
              <Upload className="w-12 h-12 text-gray-200 mb-2" />
              <p className="text-lg text-neutral-500 font-semibold mb-1">
                Upload or drag the Document
              </p>
              <p className="text-sm text-gray-500">
                PDF, DOC, DOCX, or TXT files
              </p>
            </>
          )}
          {file && !uploadedFileUrl && (
            <>
              <File className="w-12 h-12 text-gray-400 mb-2" />
              <p className="text-lg text-slate-200 font-semibold mb-1">
                {file.name}
              </p>
              <button
                onClick={uploadFile}
                className={`mt-2 px-4 py-2 bg-primary text-white rounded bg-blue-800 hover:bg-blue-600 transition-all ease-in-out ${
                  uploading ? "animate-pulse" : ""
                }`}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </>
          )}
          {uploadedFileUrl && (
            <>
              <File className="w-12 h-12 text-green-500 mb-2" />
              <p className="text-lg font-semibold mb-1">File Uploaded</p>
              <a
                href={uploadedFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View File
              </a>
              <button
                onClick={removeFile}
                className="mt-2 p-2 text-red-500 hover:text-red-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      </label>
      <ToastContainer />
    </div>
  );
}
