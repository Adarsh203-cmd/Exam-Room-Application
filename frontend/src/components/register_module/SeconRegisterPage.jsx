import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserForm from "./UserForm";
import axios from "axios";

const SecondRegisterPage = () => {
  const navigate = useNavigate();
  // Only second page fields here!
  const [formData, setFormData] = useState({
    address: "",
    pin_code: "",
    city: "",
    aadhar_number: "",
    highest_qualification: "",
  });

  useEffect(() => {
    // No need to merge savedData into formData!
    // Just ensure userData exists, else redirect back to first page
    const savedData = JSON.parse(localStorage.getItem("userData"));
    if (!savedData) {
      navigate("/first-page");
    }
    // If you want to prefill, only prefill the second page fields, e.g.:
    // setFormData(prev => ({
    //   ...prev,
    //   address: savedData?.address || '',
    //   pin_code: savedData?.pin_code || '',
    //   city: savedData?.city || '',
    //   aadhar_number: savedData?.aadhar_number || '',
    //   highest_qualification: savedData?.highest_qualification || ''
    // }));
  }, [navigate]);

  const handleSubmit = async (e, formData) => {
    e.preventDefault();

    const completeFormData = JSON.parse(localStorage.getItem("userData"));
    const finalFormData = {
      ...completeFormData,
      ...formData,
      user_type: completeFormData.user_type || "external", // ✅ ensure it's preserved
    };

    try {
      const response = await axios.post("/api/candidate/send-otp/", {
        email: finalFormData.email,
      });
      if (response.status === 200) {
        localStorage.setItem("userData", JSON.stringify(finalFormData));
        navigate("/otp-verification");
      }
    } catch (error) {
      console.error("OTP sending failed", error);
      alert("Failed to send OTP. Please try again.");
    }
  };

  return (
    <UserForm
      formTitle="Register Here - Step 2"
      showDOB={false}
      showAddress={true}
      showPincodeCity={true}
      showAadhar={true}
      showQualification={true}
      showDesignation={false}
      buttonLabel="Submit"
      handleSubmit={handleSubmit}
      formData={formData}
      setFormData={setFormData}
    />
  );
};

export default SecondRegisterPage;
