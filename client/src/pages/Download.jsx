import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import OtpInput from 'react-otp-input';
import { useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

function Download() {
    const navigate = useNavigate();
    const {userId, fileName } = useParams();
    const [otp, setOtp] = useState('');
    const [cookies, removeCookie] = useCookies([]);
   
    const downloadFile = async () => {
       if(otp.length>5){
        const response = await fetch(`http://localhost:4000/file/download/${userId}/${fileName}?searchString=${otp}`);
        if(response.ok){
           
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            navigate('/')
        }
        else{
            
            alert('Error:'+ response.statusText)
        }
    }
    else
    {
        alert('Error: Enter Complete PIN')
    }
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


            return status
                ? (console.log(""))
                : (removeCookie("token"), navigate("/login"));
        };
        verifyCookie();
    }, []);

    return (
        <div className='container d-flex flex-column justify-content-center align-items-center h-100'>
            <div className='m-4 pb-2'><label>Your File is ready to download , Enter the PIN</label></div>
            <div className='display-4 pb-5' >
                <OtpInput
                    value={otp}
                    onChange={setOtp}
                    numInputs={6}
                    renderSeparator={<span>-</span>}
                    renderInput={(props) => <input {...props} />}
                />
            </div>
            <div className='d-flex flex-row justify-content-around align-items-center w-25'>
                <button className='btn btn-primary' onClick={()=>{setOtp("")}}>Clear</button>
                <button className='btn btn-success' onClick={()=>{downloadFile()}}>Submit</button>
            </div>
        </div>
    )
}

export default Download