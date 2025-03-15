import React, { useRef, useState } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import Loader from './Loader';
import { CREATE_REQUEST } from '../graphql/mutation/scriptMutations';
import { useLazyQuery, useMutation } from '@apollo/client';
import { DialogBackdrop, Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { EXPORT_DOCUMENT_QUERY } from '../graphql/query/paragraphQueries';
import { Button, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import FileUpload from './FileUpload';
import useElementHeight from '../hooks/useElementOffset';
import { diffChars } from "diff";
import { pdfjs } from "react-pdf";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
const Paragraphs = () => {
    const nav = useNavigate()
    const { setRequest, data, refetch, setTab, loading } = useOutletContext();
    console.log(data?.getScriptById)
    const [isDownloading, setLoading] = useState(false)
    const [fetchDocument] = useLazyQuery(EXPORT_DOCUMENT_QUERY);
    const [isOpen, setIsOpen] = useState(false)
    const [files, setFiles] = useState([]);
    const [fileText, setFileText] = useState("");
    const [diffResult, setDiffResult] = useState(null);
    const [popover, setPopover] = useState(false)
    const handleDownload = async (format) => {
        setLoading(true)
        const response = await fetchDocument({
            variables: { scriptId: data?.getScriptById._id, format }
        });
        downloadFile(response.data.exportDocument.filename, response.data.exportDocument.content, response.data.exportDocument.contentType);
    };
    const extractText = async (uploadedFiles) => {
        console.log("extractText")
        let extractedText = "";
        for (const file of uploadedFiles) {
            if (file.type === "text/plain" || file.name.endsWith(".md")) {
                extractedText += await readTextFile(file);
            } else if (file.type === "application/pdf") {
                extractedText += await readPdfFile(file);
            }
        }
        console.log(extractedText)
        setFileText(extractedText);
        compareText(extractedText);
    }
    const handleFileChange = async (e) => {
        const uploadedFiles = Array.from(e.target.files);
        setFiles(uploadedFiles);
        console.log("file change")
        extractText(uploadedFiles)
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
        console.log(data?.getScriptById.combinedText)
        console.log(uploadedText)
        const differences = diffChars(data?.getScriptById.combinedText, uploadedText).filter(diff => !/^(?:\n+|\s*)$/.test(diff.value));
        console.log(differences)
        // console.log(differences.filter(diff => !diff.value.match(/^\s*$|\n/)))
        setDiffResult(differences);
    };

    const handleDrop = (e) => {
        e.preventDefault()
        const uploadedFiles = Array.from(e.dataTransfer.files);
        setFiles(uploadedFiles);
        extractText(uploadedFiles)
    };
    function downloadFile(filename, content, contentType) {

        let blob;
        let url;

        if (contentType === "application/pdf") {
            try {
                if (!/^[A-Za-z0-9+/=]+$/.test(content)) {
                    throw new Error("Invalid Base64 characters detected");
                }

                // Decode Base64
                const byteCharacters = atob(content.trim());
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                blob = new Blob([byteArray], { type: contentType });
                url = URL.createObjectURL(blob);
            } catch (error) {
                console.error("Base64 decoding error:", error);
                return;
            }
        } else {
            blob = new Blob([content], { type: contentType });
            url = URL.createObjectURL(blob);
        }

        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (blob) {
            URL.revokeObjectURL(url);
        }
        setLoading(false)
        setPopover(false)
    }



    const [showTextarea, setShowTextarea] = useState(false);
    // const [newContribution, setNewContribution] = useState("");
    const contributionEndRef = useRef(null);

    function formatFancyDate(timestamp) {
        const date = new Date(Number(timestamp));
        return `${date.getHours()}:${String(date.getSeconds()).padStart(2, "0")}`;
    }
    const height = useElementHeight('scripts')
    // useEffect(() => {
    //     if (showTextarea && contributionEndRef.current) {
    //         contributionEndRef.current.scrollIntoView({ behavior: "smooth" });
    //     }
    // }, [showTextarea]);

    // const handleContributeClick = () => {
    //     setShowTextarea(true);
    // };

    // const handlePinClick = () => {
    //     setCursorClass('cursor-pin'); // Change to pin cursor on click
    // };
    // const handleCardClick = (index) => {
    //     setPinnedCard(index); // Mark the card as pinned
    //     setCursorClass('cursor-default'); // Reset cursor to default
    // };
    const [createRequest, { loading: isLoading, error }] = useMutation(CREATE_REQUEST, {
        onCompleted: (data) => {
            console.log("Request created:", data.createRequest);
        },
        onError: (error) => {
            console.error("Error creating request:", error.message);
        },
    });

    const handleCreateRequest = async (newContribution) => {
        console.log(newContribution)
        // console.log(newContribution.trim())
        if (!newContribution.trim()) return alert("Request text cannot be empty!");
        try {
            const request = await createRequest({ variables: { scriptId: data?.getScriptById._id, text: newContribution } });
            setTab("Requests")
            nav(`/requests/${data?.getScriptById._id}`)
            refetch()
            setRequest(request.data.createRequest)
        } catch (err) {
            console.error("Mutation failed:", err);
        }
    };

    const handleCancel = () => {
        setNewContribution("");
        setShowTextarea(false);
    };

    if (loading) return <Loader />

    // Create a single date formatter instance.
    const formatter = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
    });

    // Clone and sort paragraphs to avoid mutating original data.
    const paragraphs = [...(data?.getScriptById.paragraphs || [])]
        .filter(p => !isNaN(Number(p.createdAt))) // Remove invalid timestamps
        .sort((a, b) => Number(b.createdAt) - Number(a.createdAt));

    // Group paragraphs by formatted date.
    const groupedParagraphs = paragraphs.reduce((groups, paragraph) => {
        const date = formatter.format(new Date(Number(paragraph.createdAt)));
        (groups[date] ||= []).push(paragraph);
        return groups;
    }, {});

    // Sort the date keys (most recent dates first).
    const sortedDates = Object.keys(groupedParagraphs)
        .map(date => ({ date, timestamp: new Date(date).getTime() })) // Convert to timestamp
        .sort((a, b) => b.timestamp - a.timestamp) // Sort by timestamp
        .map(item => item.date); // Extract sorted date strings



    return (
        <div className='flex flex-col gap-3'  >
            <div className='flex justify-between items-center  ' >
                <div className='flex gap-3'>
                    <h3 className='font-mulish text-4xl font-black text-gray-600 ' >
                        {data?.getScriptById.title}
                    </h3>
                </div>
                <div className='flex gap-2' >
                    <Popover className="relative">
                        <PopoverButton onClick={() => setPopover(true)} className="flex gap-2 items-center text-lg outline-none bg-gray-200/50 text-gray-600 text-md py-4 px-6 rounded-lg"> {isDownloading ? <svg aria-hidden="true" className="w-6 h-6 text-gray-400 animate-spin fill-white" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                        </svg> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>}
                            Export</PopoverButton>
                        {popover && <PopoverPanel anchor="bottom" className="flex flex-col gap-2 bg-gray-100/90 text-gray-600 mt-2 w-44 text-xl p-2 rounded-lg border-gray-300 border">
                            <button onClick={() => handleDownload("txt")} className='flex gap-2 items-center hover:bg-white p-1 rounded-md' ><img width="24" height="24" src="https://img.icons8.com/forma-light/24/737373/txt.png" alt="txt" /> .txt</button>
                            {/* <button onClick={() => handleDownload("pdf")} className='flex gap-2 items-center hover:bg-white p-1 rounded-lg'> <img width="27" height="27" src="https://img.icons8.com/small/27/737373/pdf-2.png" alt="pdf-2" /> .pdf</button> */}
                            <button onClick={() => handleDownload("md")} className='flex gap-2 items-center hover:bg-white p-1 rounded-md'><img width="24" height="24" src="https://img.icons8.com/material-outlined/24/737373/markdown.png" alt="markdown" />  .md</button>

                        </PopoverPanel>}
                    </Popover>
                    <button onClick={() => setIsOpen(true)} className='flex gap-2 items-center text-lg  bg-gray-200/50 text-gray-600 text-md py-4 px-6 rounded-lg' >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <h6>Contribute</h6>
                    </button>
                    <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none " onClose={() => setIsOpen(false)}>
                        <DialogBackdrop
                            transition
                            className="fixed inset-0 bg-black/30 duration-300 ease-out data-[closed]:opacity-0"
                        />
                        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4">
                                <DialogPanel
                                    transition
                                    className="w-full max-w-2xl flex flex-col gap-3 rounded-xl bg-gray-100 p-3 backdrop-blur-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0 h-[420px] "
                                >
                                    <div className='flex justify-between ' >

                                        <DialogTitle as="h3" className="text-2xl font-bold text-gray-600">
                                            Add Contribution
                                        </DialogTitle>


                                        <Button
                                            className="inline-flex items-center gap-2 rounded-md  text-sm/6 font-semibold text-gray-600 "
                                            onClick={() => { setIsOpen(false); setDiffResult("") }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                            </svg>

                                        </Button>
                                    </div>
                                    <FileUpload combinedText={data?.getScriptById.combinedText} handleCreateRequest={handleCreateRequest} handleCancel={handleCancel} handleFileChange={handleFileChange} handleDrop={handleDrop} isLoading={isLoading} diffResult={diffResult} />
                                    {diffResult && <div className='flex gap-2 justify-center' >
                                        <button
                                            onClick={() => handleCreateRequest(diffResult.filter(res => res.added).map(res => res.value).join(" "))}
                                            className="w-36 bg-white flex justify-center items-center gap-1 font-semibold text-gray-600 rounded"
                                        >
                                            {isLoading ? <svg aria-hidden="true" class="size-6 mx-auto text-gray-200 animate-spin dark:text-gray-600 fill-white" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                            </svg> :
                                                <span className="flex justify-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                    </svg>
                                                    Confirm
                                                </span>
                                            }
                                        </button>
                                        <button
                                            onClick={() => { setIsOpen(false); setDiffResult("") }}
                                            className="px-8 py-2 bg-white flex justify-center gap-1 font-semibold text-gray-600 rounded"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg>
                                            Cancel
                                        </button >
                                    </div>}

                                </DialogPanel>
                            </div>
                        </div>
                    </Dialog>
                </div>
            </div>
            <div className='flex flex-col gap-3 overflow-y-scroll scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 scrollbar-thumb-rounded-full' style={{ height }} id='scripts' >
                {sortedDates.map(date => (
                    <div key={date} className='flex flex-col gap-3' >
                        <h4 className='text-md text-gray-500 text-center'>{date}</h4>
                        {groupedParagraphs[date].map((contribution, index) => (
                            <Link key={index} id={contribution.id} className='target:border-indigo-300 target:border-2 flex flex-col p-2 gap-2 bg-gray-200/50 rounded-lg' to={`/para/${contribution.id}`} state={{ contribution }}>
                                <div className='flex gap-2 justify-between items-center'>
                                    <div className='flex gap-2 items-center' >
                                        <img className='rounded-full w-6' src='https://www.fufa.co.ug/wp-content/themes/FUFA/assets/images/profile.jpg' alt='Profile' />
                                        <p className='font-semibold text-lg text-gray-600'>{contribution.author.username}  </p>
                                    </div>
                                    <p className='text-sm text-gray-600'>{formatFancyDate(contribution.createdAt)}</p>
                                </div>
                                <div className='text-md text-gray-800 bg-white p-3 rounded-lg'>
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            ul: ({ children }) => <ul className="list-disc ml-5">{children}</ul>
                                        }}
                                    >

                                        {contribution.text}
                                    </ReactMarkdown>
                                    {/* <p className='text-xl font-mulish'>{contribution.text}</p> */}
                                </div>
                            </Link>
                        ))}
                    </div>
                ))}

            </div>
        </div >
    )
}

export default Paragraphs