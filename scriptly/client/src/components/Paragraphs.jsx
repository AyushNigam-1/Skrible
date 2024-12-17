import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom';
const Paragraphs = () => {
    const contributions = [
        {
            contributorName: "John Doe",
            date: "2024-09-01",
            para: "In recent years, the rise of web development has transformed how we interact with technology. From simple static websites to complex web applications, the demand for developers with a deep understanding of web technologies has increased dramatically. Web development today involves a variety of frameworks and libraries, such as React, Angular, and Vue, which make building dynamic user interfaces much more efficient. Moreover, backend technologies like Node.js, Django, and Ruby on Rails have streamlined server-side development, allowing developers to focus on creating scalable and maintainable applications. As businesses continue to migrate their operations online, the need for robust, secure, and user-friendly websites will only grow.",
            id: "3"
        },
        {
            contributorName: "Jane Smith",
            date: "2024-09-10",
            para: "Artificial Intelligence (AI) has become a driving force behind many technological advancements today. Machine learning, a subset of AI, enables computers to learn from data and make decisions without explicit programming. This ability has led to breakthroughs in various fields, including healthcare, finance, and robotics. For example, AI algorithms are being used to detect diseases at early stages, predict market trends, and improve autonomous systems. Despite its potential, AI also raises ethical concerns, such as bias in algorithms and job displacement. As AI continues to evolve, it's crucial to address these challenges and ensure that its benefits are shared by all.",
            id: "3"
        },
        {
            contributorName: "Alex Johnson",
            date: "2024-09-15",
            para: "Blockchain technology, best known for its role in powering cryptocurrencies like Bitcoin, is reshaping industries far beyond finance. At its core, blockchain is a decentralized ledger that allows secure, transparent, and tamper-proof transactions. This makes it ideal for applications in supply chain management, voting systems, and even healthcare, where trust and security are paramount. One of the key advantages of blockchain is its ability to eliminate the need for intermediaries, reducing costs and improving efficiency. However, scalability and regulatory challenges remain significant barriers to widespread adoption. As the technology matures, it's likely that we will see more innovative use cases for blockchain in the coming years.",
            id: "3"
        },
        {
            contributorName: "Emily Davis",
            date: "2024-09-22",
            para: "Cloud computing has revolutionized the way businesses operate by providing on-demand access to computing resources over the internet. Companies no longer need to invest in expensive hardware or maintain their own data centers. Instead, they can rent computing power, storage, and other services from cloud providers like Amazon Web Services (AWS), Microsoft Azure, and Google Cloud. This shift has made it easier for businesses to scale their operations, improve collaboration, and reduce IT costs. Furthermore, cloud computing enables faster innovation by allowing developers to deploy applications quickly and efficiently. However, security and compliance issues remain top concerns for businesses considering cloud adoption.",
            id: "3"
        },
        {
            contributorName: "Michael Brown",
            date: "2024-09-30",
            para: "As the world becomes more connected through the internet, the importance of cybersecurity cannot be overstated. Cyberattacks are becoming more sophisticated, and the consequences of data breaches can be devastating for both individuals and organizations. From phishing attacks to ransomware, hackers are finding new ways to exploit vulnerabilities in systems. To combat these threats, companies are investing in advanced security technologies, such as encryption, multi-factor authentication, and threat detection systems. However, technology alone is not enough. Employees must also be educated on best practices for staying safe online, such as recognizing suspicious emails and using strong passwords. As cyber threats continue to evolve, the need for comprehensive cybersecurity strategies will only grow.",
            id: "3"
        },
        {
            contributorName: "Michael Brown",
            date: "2024-09-30",
            para: "As the world becomes more connected through the internet, the importance of cybersecurity cannot be overstated. Cyberattacks are becoming more sophisticated, and the consequences of data breaches can be devastating for both individuals and organizations. From phishing attacks to ransomware, hackers are finding new ways to exploit vulnerabilities in systems. To combat these threats, companies are investing in advanced security technologies, such as encryption, multi-factor authentication, and threat detection systems. However, technology alone is not enough. Employees must also be educated on best practices for staying safe online, such as recognizing suspicious emails and using strong passwords. As cyber threats continue to evolve, the need for comprehensive cybersecurity strategies will only grow.",
            id: "3"
        },
        {
            contributorName: "Michael Brown",
            date: "2024-09-30",
            para: "As the world becomes more connected through the internet, the importance of cybersecurity cannot be overstated. Cyberattacks are becoming more sophisticated, and the consequences of data breaches can be devastating for both individuals and organizations. From phishing attacks to ransomware, hackers are finding new ways to exploit vulnerabilities in systems. To combat these threats, companies are investing in advanced security technologies, such as encryption, multi-factor authentication, and threat detection systems. However, technology alone is not enough. Employees must also be educated on best practices for staying safe online, such as recognizing suspicious emails and using strong passwords. As cyber threats continue to evolve, the need for comprehensive cybersecurity strategies will only grow.",
            id: "3"
        },
        {
            contributorName: "Michael Brown",
            date: "2024-09-30",
            para: "As the world becomes more connected through the internet, the importance of cybersecurity cannot be overstated. Cyberattacks are becoming more sophisticated, and the consequences of data breaches can be devastating for both individuals and organizations. From phishing attacks to ransomware, hackers are finding new ways to exploit vulnerabilities in systems. To combat these threats, companies are investing in advanced security technologies, such as encryption, multi-factor authentication, and threat detection systems. However, technology alone is not enough. Employees must also be educated on best practices for staying safe online, such as recognizing suspicious emails and using strong passwords. As cyber threats continue to evolve, the need for comprehensive cybersecurity strategies will only grow.",
            id: "3"
        },
        {
            contributorName: "Michael Brown",
            date: "2024-09-30",
            para: "As the world becomes more connected through the internet, the importance of cybersecurity cannot be overstated. Cyberattacks are becoming more sophisticated, and the consequences of data breaches can be devastating for both individuals and organizations. From phishing attacks to ransomware, hackers are finding new ways to exploit vulnerabilities in systems. To combat these threats, companies are investing in advanced security technologies, such as encryption, multi-factor authentication, and threat detection systems. However, technology alone is not enough. Employees must also be educated on best practices for staying safe online, such as recognizing suspicious emails and using strong passwords. As cyber threats continue to evolve, the need for comprehensive cybersecurity strategies will only grow.",
            id: "3"
        },
        {
            contributorName: "Michael Brown",
            date: "2024-09-30",
            para: "As the world becomes more connected through the internet, the importance of cybersecurity cannot be overstated. Cyberattacks are becoming more sophisticated, and the consequences of data breaches can be devastating for both individuals and organizations. From phishing attacks to ransomware, hackers are finding new ways to exploit vulnerabilities in systems. To combat these threats, companies are investing in advanced security technologies, such as encryption, multi-factor authentication, and threat detection systems. However, technology alone is not enough. Employees must also be educated on best practices for staying safe online, such as recognizing suspicious emails and using strong passwords. As cyber threats continue to evolve, the need for comprehensive cybersecurity strategies will only grow.",
            id: "3"
        },
        {
            contributorName: "Michael Brown",
            date: "2024-09-30",
            para: "As the world becomes more connected through the internet, the importance of cybersecurity cannot be overstated. Cyberattacks are becoming more sophisticated, and the consequences of data breaches can be devastating for both individuals and organizations. From phishing attacks to ransomware, hackers are finding new ways to exploit vulnerabilities in systems. To combat these threats, companies are investing in advanced security technologies, such as encryption, multi-factor authentication, and threat detection systems. However, technology alone is not enough. Employees must also be educated on best practices for staying safe online, such as recognizing suspicious emails and using strong passwords. As cyber threats continue to evolve, the need for comprehensive cybersecurity strategies will only grow.",
            id: "3"
        }
    ];
    const [pinnedCard, setPinnedCard] = useState(null);
    const [showTextarea, setShowTextarea] = useState(false);
    const [newContribution, setNewContribution] = useState("");
    const contributionEndRef = useRef < HTMLDivElement | null > (null);


    useEffect(() => {
        if (showTextarea && contributionEndRef.current) {
            contributionEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [showTextarea]);

    const handleContributeClick = () => {
        setShowTextarea(true);
    };

    const handlePinClick = () => {
        setCursorClass('cursor-pin'); // Change to pin cursor on click
    };
    const handleCardClick = (index) => {
        setPinnedCard(index); // Mark the card as pinned
        setCursorClass('cursor-default'); // Reset cursor to default
    };

    // const handleAddContribution = () => {
    //     if (newContribution.trim()) {
    //         contributions.push();
    //         setNewContribution("");
    //         setShowTextarea(false);
    //     }
    // };
    const handleCancel = () => {
        setNewContribution("");
        setShowTextarea(false);
    };
    return (
        <div className='flex flex-col gap-6' >
            <div className='flex justify-between top-2 ' >
                <div className='flex gap-3'>
                    <h3 className='font-sans text-3xl font-bold text-gray-800 ' >
                        Untitled
                    </h3>
                    <button className='rounded-full p-1 bg-white px-3' >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 text-indigo-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                        </svg>
                    </button>
                </div>
                <div className='flex gap-2' >
                    <button className='flex gap-2 items-center text-sm shadow bg-indigo-400 text-white text-md px-3 py-2 rounded-md' onClick={handlePinClick} >
                        <img src="/pin.png" alt="" width="20px" />
                        <h6>Pin</h6>
                    </button>
                    <button onClick={handleContributeClick} className='flex gap-2 text-sm items-center bg-indigo-400 text-white shadow text-md px-3 py-2 rounded-md' >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <h6>Contribute</h6>
                    </button>
                    <button className='flex gap-2 items-center shadow text-sm bg-indigo-400 text-white text-md  px-3 py-2  rounded-md' >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                        </svg>
                        <h6>Zen Mode</h6>
                    </button>
                </div>
            </div>
            {/* <hr /> */}
            {
                contributions.map((contribution, index) =>
                    <Link className='flex gap-1' to={`/para/${contribution.id}`} >
                        <div className='word-spacing-1 flex flex-col relative gap-1 bg-white shadow-md rounded-lg p-4'

                        // onClick={() => handleCardClick(index)}
                        >
                            {/* <img src="/person.jpg" className='rounded-full w-5 h-5 ' alt="" /> */}
                            <div className='flex gap-2 justify-between items-center' >
                                <span className='text-gray-600  gap-2 flex items-center' >
                                    <img src="/person.jpg" className='rounded-full w-4 h-4 ' alt="" />
                                    <p className='text-sm'>
                                        John Doe
                                    </p>
                                </span>
                                <div className='flex gap-2' >
                                    {/* {pinnedCard === index && (
                                    <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded">
                                        Pinned
                                    </span>
                                )} */}
                                    <p className='text-gray-600 text-xs shadow'> Tue, 19 Nov 2024, 22:30</p>
                                </div>
                            </div>
                            <div className='  text-md text-gray-800' >
                                <p className=''>
                                    {contribution.para}
                                </p>
                            </div>
                        </div>
                    </Link>
                )
            }
            {/* <div
                className={`overflow-hidden transition-all duration-300 ease-in-out flex flex-col gap-4  ${showTextarea ? "opacity-100 " : "opacity-0 "
                    }`}>
                <textarea
                    rows={6}
                    value={newContribution}
                    onChange={(e) => setNewContribution(e.target.value)}
                    className="w-full shadow-md border-none rounded-lg p-4 outline-none resize-none"
                    placeholder="Add your contribution..."
                />
                <div className='flex gap-3' >
                    <button
                        onClick={handleAddContribution}
                        className="px-8 py-2 flex justify-center gap-1 bg-indigo-400 text-gray-200 font-semibold rounded"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>

                        Submit
                    </button>
                    <button
                        onClick={handleCancel}
                        className="px-8 py-2 bg-gray-300 flex justify-center gap-1 font-semibold text-gray-800 rounded"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>

                        Cancel
                    </button >
                </div>
            </div> */}
            {/* Reference to scroll to the end */}
            {/* <div ref={contributionEndRef} ></div> */}
            {/* </div> */}
        </div>
    )
}

export default Paragraphs