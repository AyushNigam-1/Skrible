import React, { useRef, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import Loader from "./Loader";
import { SUBMIT_PARAGRAPH } from "../graphql/mutation/scriptMutations";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Popover, PopoverButton, PopoverPanel, Dialog, DialogPanel } from "@headlessui/react";
import { EXPORT_DOCUMENT_QUERY } from "../graphql/query/paragraphQueries";
import FileUpload from "./FileUpload";
import useElementHeight from "../hooks/useElementOffset";
import { diffChars } from "diff";
import { pdfjs } from "react-pdf";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const Paragraphs = () => {
    const nav = useNavigate();
    const { data, refetch, loading } = useOutletContext();
    console.log("data", data)
    const [isDownloading, setLoading] = useState(false);
    const [fetchDocument] = useLazyQuery(EXPORT_DOCUMENT_QUERY);
    const [isOpen, setIsOpen] = useState(false);
    const [files, setFiles] = useState([]);
    const [fileText, setFileText] = useState("");
    const [diffResult, setDiffResult] = useState(null);
    const [popover, setPopover] = useState(false);

    const [submitParagraph, { loading: isSubmitting }] = useMutation(SUBMIT_PARAGRAPH);

    const handleDownload = async (format) => {
        setLoading(true);
        const response = await fetchDocument({
            variables: { scriptId: data?.getScriptById.id, format },
        });

        downloadFile(
            response.data.exportDocument.filename,
            response.data.exportDocument.content,
            response.data.exportDocument.contentType
        );
    };

    const extractText = async (uploadedFiles) => {
        let extractedText = "";

        for (const file of uploadedFiles) {
            if (file.type === "text/plain" || file.name.endsWith(".md")) {
                extractedText += await readTextFile(file);
            } else if (file.type === "application/pdf") {
                extractedText += await readPdfFile(file);
            }
        }

        setFileText(extractedText);
        compareText(extractedText);
    };

    const handleFileChange = async (e) => {
        const uploadedFiles = Array.from(e.target.files);
        setFiles(uploadedFiles);
        extractText(uploadedFiles);
    };

    const readTextFile = (file) =>
        new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsText(file);
        });

    const readPdfFile = (file) =>
        new Promise((resolve) => {
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

    const compareText = (uploadedText) => {
        const differences = diffChars(data?.getScriptById.combinedText || "", uploadedText);
        setDiffResult(differences);
    };

    const handleCreateContribution = async (text) => {
        if (!text.trim()) return alert("Contribution cannot be empty");

        await submitParagraph({
            variables: {
                scriptId: data?.getScriptById.id,
                text,
            },
        });

        refetch();
        setIsOpen(false);
    };

    function downloadFile(filename, content, contentType) {
        const blob =
            contentType === "application/pdf"
                ? new Blob([Uint8Array.from(atob(content), (c) => c.charCodeAt(0))], { type: contentType })
                : new Blob([content], { type: contentType });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        setLoading(false);
        setPopover(false);
    }

    if (loading) return <Loader />;

    const formatter = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    const paragraphs = [...(data?.getScriptById.paragraphs || [])].sort(
        (a, b) => Number(b.createdAt) - Number(a.createdAt)
    );

    const groupedParagraphs = paragraphs.reduce((groups, paragraph) => {
        const date = formatter.format(new Date(Number(paragraph.createdAt)));
        (groups[date] ||= []).push(paragraph);
        return groups;
    }, {});

    const sortedDates = Object.keys(groupedParagraphs);

    return (
        <div className="flex flex-col gap-4">
            {sortedDates.map((date) => (
                <div key={date}>
                    <h4 className="text-center text-gray-500">{date}</h4>
                    {groupedParagraphs[date].map((p) => (
                        <Link key={p.id} to={`/para/${p.id}`} className="block bg-gray-200/50 p-3 rounded">
                            <p className="font-semibold">{p.author.username}</p>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{p.text}</ReactMarkdown>
                        </Link>
                    ))}
                </div>
            ))}

            <button onClick={() => setIsOpen(true)}>Contribute</button>

            <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
                <DialogPanel>
                    <FileUpload
                        combinedText={data?.getScriptById.combinedText}
                        handleFileChange={handleFileChange}
                        diffResult={diffResult}
                    />

                    {diffResult && (
                        <button
                            disabled={isSubmitting}
                            onClick={() =>
                                handleCreateContribution(diffResult.filter(d => d.added).map(d => d.value).join(" "))
                            }
                        >
                            Submit
                        </button>
                    )}
                </DialogPanel>
            </Dialog>
        </div>
    );
};

export default Paragraphs;
