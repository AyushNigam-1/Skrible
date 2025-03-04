import React, { useState } from "react";
import { diffChars } from "diff";
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
const FileUpload = ({ combinedText, handleCreateRequest, handleCancel, isLoading }) => {
    console.log(isLoading)
    const [files, setFiles] = useState([]);
    const [fileText, setFileText] = useState("");
    const [diffResult, setDiffResult] = useState(null);

    const handleFileChange = async (e) => {
        const uploadedFiles = Array.from(e.target.files);
        setFiles(uploadedFiles);

        let extractedText = "";
        for (const file of uploadedFiles) {
            if (file.type === "text/plain") {
                extractedText += await readTextFile(file);
            } else if (file.type === "application/pdf") {
                extractedText += await readPdfFile(file);
            }
        }
        setFileText(extractedText);
        compareText(extractedText);
    };

    const readTextFile = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsText(file);
        });
    };

    const readPdfFile = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const typedArray = new Uint8Array(e.target.result);
                const pdf = await pdfjs.getDocument(typedArray).promise;
                let text = "";
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    text += content.items.map((item) => item.str).join(" ") + " ";
                }
                resolve(text);
            };
            reader.readAsArrayBuffer(file);
        });
    };

    const compareText = (uploadedText) => {
        console.log(combinedText)
        const differences = diffChars(combinedText, uploadedText).filter(diff => !/^(?:\n+|\s*)$/.test(diff.value));
        console.log(differences)
        // console.log(differences.filter(diff => !diff.value.match(/^\s*$|\n/)))
        setDiffResult(differences);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setFiles([...files, ...Array.from(e.dataTransfer.files)]);
    };


    return (
        <div className="rounded-lg h-full overflow-y-scroll scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white scrollbar-thumb-rounded-full" >
            {diffResult ? <div className="flex flex-col gap-2" > <div className="bg-white rounded-lg p-3 pb-0 overflow-y-auto " > {diffResult.map(res => {
                return (
                    <div className={`${res.added ? 'bg-green-50 border-green-300  border-2 p-3  -mx-3' : res.removed ? 'bg-red-50 border-red-300 border-2 p-3 ' : 'pb-0'}  rounded-lg flex flex-col gap-1 text-gray-800`}>
                        {res.added ? <span className=" text-green-600  rounded-lg  flex gap-1  items-center" ><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                            You Added </span> : res.removed ? <span className="border-red-300 text-red-600 rounded-lg   flex gap-1 items-center" > <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                            </svg>

                                Missing </span> : ''}
                        <p>
                            <p className="text-lg" >
                                {res.value}
                            </p>
                        </p>
                    </div>
                )
            })}</div>

            </div> : <div
                className="flex flex-col h-full items-center justify-center p-6 border-2 border-dashed text-gray-500 border-gray-300 rounded cursor-pointer"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="size-24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>

                <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    id="fileInput"
                />
                <label htmlFor="fileInput" className=" cursor-pointer">
                    Drag files here or <span className="text-blue-500 underline" >Click To Upload</span>
                </label>
            </div>}
            {/* <div className="border p-3 mt-2">
                <h3 className="text-lg font-bold">Comparison Result:</h3>

            </div> */}
            {/* {files.length > 0 && (
                <ul className="mt-4">
                    {files.map((file, index) => (
                        <li key={index} className="flex justify-between p-2 border-b">
                            {file.name}
                            <button
                                className="text-red-500"
                                onClick={() => removeFile(index)}
                            >
                                ✖
                            </button>
                        </li>
                    ))}
                </ul>
            )} */}
        </div >
    );
};

export default FileUpload;
