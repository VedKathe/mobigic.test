import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import Navbar from "../components/Navbar";
import Cookies from "js-cookie";
import Files from '../components/Files'

const Home = () => {
    const navigate = useNavigate();
    const [cookies, removeCookie] = useCookies([]);
    const [username, setUsername] = useState("");
    const [userId, setUserId] = useState("");
    const [userData, setuserData] = useState([]);
    const [fileUploaded, setfileUploaded] = useState(false);

    const fileUpload = () => {
        setfileUploaded(!fileUploaded)
    };

    const getFiles = async () => {
        const response = await axios.get("http://localhost:4000/file", {
            headers: {
                'user-id': userId
            }
        })
            .then(function (response) {

                setuserData(response.data)

            })
            .catch(error =>

                toast.error("Error uploading file", {
                    position: "bottom-left",
                })
            );
    };

    useEffect(() => {

        const verifyCookie = async () => {
            const cokie = Cookies.get('token')

            if (!cokie) {

                navigate("/login");
            }
            const { data } = await axios.post(
                "http://localhost:4000",
                {},
                { withCredentials: true }
            );
            const { status, user, userId } = data;
            setUsername(user);
            setUserId(userId);

            return status
                ? (console.log(""))
                : (removeCookie("token"), navigate("/login"));
        };
        verifyCookie();
    }, []);

    useEffect(() => {
        getFiles()
    }, [userId, fileUploaded])


    const Logout = () => {
        removeCookie("token");
        navigate("/login");
    };

    const deleteFile = async (filename) => {

        const response = await axios.delete(`http://localhost:4000/file/delete/${userId}/${filename}`)
            .then(function (response) {

                fileUpload()

            })
            .catch(error =>

                toast.error("Error uploading file", {
                    position: "bottom-left",
                })
            );
    };

    const downloadFile = async (filename) => {

        const response = await fetch(`http://localhost:4000/file/download/${userId}/${filename}`);
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        
    };

    const navigateToDownload =  async (filename) => {
        navigate(`/download/${userId}/${filename}`)
    }

    const onFileUpload = async (file,model,setFile) => {

        if (userData.includes(file.name)) {
            
            alert("File Already Exist");
            return
        } 

        const formData = new FormData();
        formData.append('file', file);


        await axios.post("http://localhost:4000/file/upload", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'user-id': userId
            }
        }).then(function (response) {
            
            setTimeout(() => {
                setFile(null)
                fileUpload()
                model()
            }, 1000)

        }).catch(error =>
           console.log(error)
        );
    };

    return (
        <div className="files-background d-flex flex-column justi">
            <Navbar user={username} userid={userId} fileUpload={fileUpload} onFileUpload={onFileUpload} logout={Logout}></Navbar>
            <div className="h-100">
                <div className="files-container h-100 px-2">

                    {
                        (userData.length === 0) ? (<div className="no-file h4"> No File Uploaded</div>) : (Array.isArray(userData) &&
                            userData.map((file, index) => (
                                <Files key={index} className="file-item" filename={file} deleteFile={deleteFile} downloadFile={downloadFile} navigateToDownload ={navigateToDownload}></Files>
                            )))

                    }
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Home;