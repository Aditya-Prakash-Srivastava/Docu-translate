import React from "react";
import { useDropzone } from "react-dropzone";

function FileUpload({ file, setFile }) {
  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: {
      "text/plain": [".txt"],
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
    },
  });

  const removeFile = () => {
    setFile(null);
  };

  return (
    <div className="text-center mt-8">
      <div
        {...getRootProps()}
        className={`w-full max-w-md h-36 border-2 border-dashed border-gray-400 rounded-xl flex flex-col items-center justify-center mx-auto cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${file ? "border-blue-500 bg-blue-50" : ""
          }`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-600 px-4">
          {file ? "File selected" : "Drag & drop file (TXT, PDF, JPG, PNG)"}
        </p>
      </div>

      {file && (
        <div className="inline-flex items-center gap-3 px-4 py-2 mt-4 border border-gray-200 rounded-lg bg-white shadow-sm max-w-full">
          <span className="truncate max-w-[200px] text-gray-700">
            {file.name}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              removeFile();
            }}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
