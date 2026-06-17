import React, { useRef, useState } from 'react';

export default function DropZone({ label, onFile, file, rowCount }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }

  function handleChange(e) {
    const f = e.target.files[0];
    if (f) onFile(f);
  }

  return (
    <div
      onClick={() => inputRef.current.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`
        flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer
        transition-colors select-none min-h-[220px]
        ${dragging ? 'border-accent bg-accent/5' : 'border-gray-300 hover:border-accent hover:bg-accent/5'}
        ${file ? 'border-success bg-success/5' : ''}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleChange}
      />
      <div className="text-4xl mb-3">{file ? '📊' : '📁'}</div>
      <div className="font-semibold text-gray-700 mb-1">{label}</div>
      {file ? (
        <>
          <div className="text-sm text-success font-medium">{file.name}</div>
          {rowCount != null && (
            <div className="text-xs text-gray-500 mt-1">{rowCount.toLocaleString()} rows detected</div>
          )}
        </>
      ) : (
        <div className="text-sm text-gray-400">Drag & drop or click to browse</div>
      )}
    </div>
  );
}
