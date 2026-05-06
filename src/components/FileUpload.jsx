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
    <div className="w-full h-full flex flex-col">
      <div
        {...getRootProps()}
        className={`flex-1 w-full min-h-[200px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
          file 
            ? "border-blue-300 bg-blue-50/50" 
            : "border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-center p-6">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm font-medium text-gray-700">
            {file ? "Replace file" : "Drag and drop or click to upload"}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Supported formats: TXT, PDF, JPG, PNG
          </p>
        </div>
      </div>

      {file && (
        <div className="mt-4 flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3 overflow-hidden">
            <svg className="w-6 h-6 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-gray-700 truncate font-medium">
              {file.name}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeFile();
            }}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
            title="Remove file"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
