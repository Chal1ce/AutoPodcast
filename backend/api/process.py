import re
import PyPDF2
from fastapi import APIRouter, UploadFile, File, Body
from typing import List
from pydantic import BaseModel

process_router = APIRouter()

@process_router.post("/process_file")
async def process_file(files: List[UploadFile] = File(...)):
    """
    处理多个PDF文件的函数
    
    参数:
    files (List[UploadFile]): PDF文件列表
    
    返回:
    str: 提取的文本内容
    """
    try:
        all_text = ""
        for file in files:
            # 创建PDF阅读器对象
            pdf_reader = PyPDF2.PdfReader(file.file)
            # 初始化文本变量
            text = ""
            # 遍历所有页面并提取文本
            for page in pdf_reader.pages:
                if len(page.extract_text()) > 5:
                    text += page.extract_text()
            # 去除引用文献
            text = re.sub(r'\[\d+\]', '', text)
            # 去除注释（假设注释是在括号内的）
            text = re.sub(r'\([^()]*\)', '', text)
            # 去除多余的空白字符
            text = re.sub(r'\s+', ' ', text).strip()
            all_text += text + "\n\n"

        return all_text
    except Exception as e:
        print(f"处理PDF时出错: {str(e)}")
        return {"error": str(e)}

class DialogRequest(BaseModel):
    text: str
    role: str

@process_router.post("/generate_dialog")
async def generate_dialog(request: DialogRequest):
    """
    生成对话的函数
    
    参数:
    request (DialogRequest): 包含处理后的文本和选择的角色
    
    返回:
    dict: 生成的对话或处理结果
    """
    try:
        # 在这里处理文本和角色，生成对话
        # 这里只是一个示例，您需要根据实际需求实现对话生成逻辑
        generated_dialog = f"基于角色 '{request.role}' 生成的对话：\n{request.text[:100]}..."
        
        return {"dialog": generated_dialog}
    except Exception as e:
        print(f"生成对话时出错: {str(e)}")
        return {"error": str(e)}
