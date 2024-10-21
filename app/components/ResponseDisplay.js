import React, { useState, useRef } from 'react';

const ResponseDisplay = ({ generatedText, isLoading, setGeneratedText, ttsModelMode, selectedTtsModel }) => {
  if (isLoading) {
    return <div className="mt-4">正在生成中...</div>;
  }

  if (!generatedText || generatedText.length === 0) {
    return null;
  }

  const handleContentChange = (index, newContent) => {
    const updatedText = [...generatedText];
    updatedText[index].content = newContent;
    setGeneratedText(updatedText);
  };

  // 添加一个状态来跟踪发送状态
  const [isSending, setIsSending] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const audioRef = useRef(null);

  const handleConfirm = async () => {
    const dataToSend = generatedText.map(item => ({
      speaker: item.speaker,
      content: item.content
    }));
    
    setIsSending(true);
    try {
      let url;
      if (ttsModelMode === 'api' && selectedTtsModel === 'reecho') {
        url = 'http://127.0.0.1:8000/reecho/reecho';
      } else if (ttsModelMode === 'local' && selectedTtsModel === 'coquitts') {
        url = 'http://127.0.0.1:8000/coqui_tts/tts_to_file';
      } else {
        throw new Error('不支持的 TTS 模式或模型');
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let newAudioUrl;
      if (ttsModelMode === 'api') {
        const result = await response.json();
        newAudioUrl = result; // Reecho API 直接返回音频 URL
      } else {
        // 对于 CoquiTTS，直接使用响应 URL
        newAudioUrl = URL.createObjectURL(await response.blob());
      }
      
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
      link.download = '对话音频.wav'; // 改为 .wav 扩展名
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadText = () => {
    const text = generatedText.map(item => `${item.speaker}：${item.content}`).join('\n\n');
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
    <div className="container space-y-6">
      <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-md p-4 mb-4">
        {generatedText.map((item, index) => (
          <div key={index} className="mb-4 last:mb-0">
            <div className="mb-2 font-semibold bg-gray-100 p-2 rounded-t-md">
              {item.speaker}：
            </div>
            <textarea
              className="textarea"
              value={item.content}
              onChange={(e) => handleContentChange(index, e.target.value)}
            />
          </div>
        ))}
      </div>
      
      <div className="button-group mt-4">
        <button 
          className={`btn ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleConfirm}
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
  );
};

export default ResponseDisplay;
