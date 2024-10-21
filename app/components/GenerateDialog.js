import React from 'react';
import Button from './button';

const GenerateDialog = ({ topic, format, setGeneratedText, setIsLoading, model }) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  const handleGenerateScript = async () => {
    console.log("开始生成脚本");
    setIsLoading(true);
    setGeneratedText([]);
    try {
      const requestBody = JSON.stringify({ topic, format });
      console.log("发送的请求体:", requestBody);

      const response = await fetch(`${apiUrl}/${model}/topic2talk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("收到响应:", data);
      
      setGeneratedText(data);
    } catch (error) {
      console.error("生成脚本时出错:", error);
      setGeneratedText([{ speaker: '错误', content: `发生错误: ${error.message}` }]);
    } finally {
      setIsLoading(false);
      console.log("脚本生成结束");
    }
  }

  return (
    <Button onClick={handleGenerateScript} className="w-full">
      生成对话
    </Button>
  );
};

export default GenerateDialog;
