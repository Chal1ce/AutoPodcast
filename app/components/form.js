import React from 'react';

const Form = ({ topic, setTopic, format, setFormat }) => {
  return (
    <form className="w-full max-w-md">
      <div className="mb-4">
        <label htmlFor="topic" className="block text-sm font-medium mb-2">播客主题</label>
        <input
          type="text"
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="format" className="block text-sm font-medium mb-2">角色选择</label>
        <select
          id="format"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="一个主持人，一个嘉宾，一个专家">一个主持人，一个嘉宾，一个专家</option>
          <option value="一个主持人，两位专家">一个主持人，两位专家</option>
        </select>
      </div>
    </form>
  );
};

export default Form;
