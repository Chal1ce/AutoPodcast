'use client';

import { useState, useRef } from "react";

export default function FileUpload() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [processedText, setProcessedText] = useState("");
  const [processingStatus, setProcessingStatus] = useState(""); // 新增状态
  const [generatingDialog, setGeneratingDialog] = useState(false); // 新增状态
  const [buttonState, setButtonState] = useState("idle"); // 新增状态来管理按钮状态
  const [generatedDialog, setGeneratedDialog] = useState([]); // 新增状态来存储生成的对话
  const [editableDialog, setEditableDialog] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const audioRef = useRef(null);

  const isPDF = (file) => {
    return file.type === "application/pdf";
  };

  const handleFiles = (newFiles) => {
    const pdfFiles = newFiles.filter(file => isPDF(file));
    const nonPdfFiles = newFiles.filter(file => !isPDF(file));

    if (nonPdfFiles.length > 0) {
      setError(`以下文件不是PDF格式，已被忽略：${nonPdfFiles.map(f => f.name).join(', ')}`);
      setTimeout(() => setError(""), 5000);
    }

    setFiles(prevFiles => [...prevFiles, ...pdfFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  const uploadFiles = async () => {
    setButtonState("processing"); // 设置按钮状态为处理文件中
    setProcessingStatus(""); // 重置处理状态
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('http://127.0.0.1:8000/process/process_file', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.text();
        setProcessedText(result);
        setProcessingStatus("处理成功"); // 设置成功状态
        setButtonState("generating"); // 设置按钮状态为生成对话中
        
        // 发送处理后的文本和角色到新的端点
        await sendProcessedTextAndRole(result, selectedRole);
      } else {
        throw new Error('处理失败');
      }
    } catch (error) {
      setError('文件处理失败，请重试。');
      setProcessingStatus("处理失败"); // 设置失败状态
      setButtonState("idle"); // 重置按钮状态
      setTimeout(() => setError(""), 5000);
    }
  };

  const sendProcessedTextAndRole = async (text, characters) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/deepseek/file2talk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, characters }),
      });

      if (!response.ok) {
        throw new Error('发送处理后的文本和角色失败');
      }

      const result = await response.json();
      console.log(result);
      setGeneratedDialog(result);
      setEditableDialog(result); // 初始化可编辑对话
      setProcessingStatus("对话生成成功");
    } catch (error) {
      console.error('发送处理后的文本和角色时出错:', error);
      setError('发送处理后的文本和角色失败，请重试。');
      setProcessingStatus("对话生成失败");
      setTimeout(() => setError(""), 5000);
    } finally {
      setButtonState("idle");
    }
  };

  const handleDialogEdit = (index, newContent) => {
    const updatedDialog = [...editableDialog];
    updatedDialog[index].content = newContent;
    setEditableDialog(updatedDialog);
  };

  const handleConfirmDialog = async () => {
    const dataToSend = editableDialog.map(item => ({
      speaker: item.speaker,
      content: item.content
    }));
    
    setIsSending(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/reecho/reecho', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('后端响应:', result);
      
      // 直接使用后端返回的 audio_url
      const newAudioUrl = result;
      console.log('音频URL:', newAudioUrl);
      setAudioUrl(newAudioUrl);

    } catch (error) {
      console.error('发送数据时出错:', error);
      alert('发送数据失败,请重试: ' + error.message);
    } finally {
      setIsSending(false);
    }
  };

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const handleDownloadAudio = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = '对话音频.mp3';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadText = () => {
    const text = editableDialog.map(item => `${item.speaker}：${item.content}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '对话文本.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          type="file"
          onChange={handleChange}
          className="hidden"
          id="fileInput"
          multiple
          accept=".pdf"
        />
        <label htmlFor="fileInput" className="cursor-pointer text-lg font-semibold text-gray-700 hover:text-gray-900">
          拖拽PDF文件到这里或点击选择文件
        </label>
      </div>
      
      {error && (
        <div className="text-red-500 text-sm text-center">{error}</div>
      )}

      {files.length > 0 && (
        <ul className="bg-white rounded-lg shadow-sm overflow-hidden">
          {files.map((file, index) => (
            <li key={index} className="flex justify-between items-center p-3 border-b last:border-b-0">
              <span className="text-sm text-gray-600 truncate max-w-xs">{file.name}</span>
              <button 
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700 text-sm font-medium ml-4"
              >
                删除
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4">
        <label htmlFor="roleSelect" className="block text-sm font-medium text-gray-700 mb-2">
          选择对话格式
        </label>
        <select
          id="roleSelect"
          value={selectedRole}
          onChange={handleRoleChange}
          className="w-full p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">请选择对话格式</option>
          <option value="一个主持人，一个嘉宾，一个专家">一个主持人，一个嘉宾，一个专家</option>
          <option value="一个主持人，两位专家">一个主持人，两位专家</option>
        </select>
      </div>

      {files.length > 0 && (
        <button
          onClick={uploadFiles}
          disabled={buttonState !== "idle" || !selectedRole}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline disabled:opacity-50 transition-colors"
        >
          {buttonState === "processing" ? '处理文件中...' : 
           buttonState === "generating" ? '生成对话中...' : '处理文件'}
        </button>
      )}

      {processingStatus && (
        <div className={`text-center font-semibold ${processingStatus.includes('成功') ? 'text-green-500' : 'text-red-500'}`}>
          {processingStatus}
        </div>
      )}

      {/* 只显示可编辑的对话 */}
      {editableDialog.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">生成的对话（可编辑）：</h3>
          <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-md p-4">
            {editableDialog.map((item, index) => (
              <div key={index} className="mb-4 last:mb-0">
                <div className="font-semibold bg-gray-100 p-2 rounded-t-md">
                  {item.speaker}：
                </div>
                <textarea
                  className="w-full p-2 text-sm text-gray-700 border border-t-0 border-gray-300 rounded-b-md"
                  value={item.content}
                  onChange={(e) => handleDialogEdit(index, e.target.value)}
                  rows={3}
                />
              </div>
            ))}
          </div>
          <div className="button-group mt-8">
            <button 
              className={`btn ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleConfirmDialog}
              disabled={isSending}
            >
              {isSending ? '生成语音中...' : '确认文案'}
            </button>

            <button
              className="btn"
              onClick={handleDownloadText}
            >
              下载对话文本
            </button>

            {audioUrl && (
              <button
                className="btn"
                onClick={handleDownloadAudio}
              >
                下载音频
              </button>
            )}
          </div>

          {audioUrl && (
            <div className="audio-player">
              <audio ref={audioRef} src={audioUrl} controls className="w-full" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
