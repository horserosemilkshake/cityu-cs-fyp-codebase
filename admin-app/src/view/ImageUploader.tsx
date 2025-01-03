import React, { useState } from 'react';
import { externalServiceURL, mode } from '../global';
import { useSelector } from 'react-redux';
import { RootState } from '../state/Store';
import NavBar from '../components/NavBar';
import { useNavigate } from 'react-router';
// import "../assets/ImageUploader.css";

const ImageUploader: React.FC = () => {
  const [frontViewImage, setFrontViewImage] = useState<File | null>(null);
  const [sideViewImage, setSideViewImage] = useState<File | null>(null);
  const [processedFrontView, setProcessedFrontView] = useState<string>('');
  const [processedSideView, setProcessedSideView] = useState<string>('');
  const [l1, setL1] = useState<number>(0);
  const [w1, setW1] = useState<number>(0);
  const [w2, setW2] = useState<number>(0);
  const [h1, setH1] = useState<number>(0);
  const [dim, setDim] = useState<[number, number, number]>([0, 0, 0]);
  const [showDims, setShowDims] = useState<boolean>(false);
  const usernameGlobal = useSelector((state: RootState) => state.profile.usernameGlobal);
  const navigate = useNavigate();

  const handleFrontViewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFrontViewImage(selectedFile);
    }
  };

  const handleSideViewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setSideViewImage(selectedFile);
    }
  };

  const handleGoBackNavigation = () => {
    navigate("/add");
  }

  const calculateDims = () => {
    const numbers = [l1, w1, w2, h1];
    console.log(numbers);
    numbers.sort((a, b) => a - b);

    let minDiff = Infinity;
    let closestPair: [number, number] = [0, 0];

    for (let i = 0; i < numbers.length - 1; i++) {
      const diff = Math.abs(numbers[i] - numbers[i + 1]);
      if (diff < minDiff) {
        minDiff = diff;
        closestPair = [numbers[i], numbers[i + 1]];
      }
    }

    const average = (closestPair[0] + closestPair[1]) / 2;
    const irrelevant1 = numbers.find((num) => num !== closestPair[0] && num !== closestPair[1])!;
    const irrelevant2 = numbers.find((num) => num !== irrelevant1 && num !== closestPair[0] && num !== closestPair[1])!;

    setDim([
      average,
      irrelevant1,
      irrelevant2
    ]);

    localStorage.setItem("l", average.toFixed(1).toString());
    localStorage.setItem("w", irrelevant1.toFixed(1).toString());
    localStorage.setItem("h", irrelevant2.toFixed(1).toString());

    setShowDims(true);
  }

  const uploadFrontViewImages = async () => {
    if (frontViewImage) {
      const formData = new FormData();
      formData.append('image', frontViewImage);
      const url = mode === "p" ? "http://47.238.184.88:1234" + "/measure" : "http://127.0.0.1:1234" + "/measure";

      try {
        const response = await fetch(url, {
          method: 'POST',
          // headers: {
          //   'Content-Type': 'application/json',
          //   // Add any additional headers if required
          // },
          body: formData,
        });

        const data = await response.json();
        const processedImageDataURL = `data:image/png;base64,${data.image}`;
        setProcessedFrontView(processedImageDataURL);
        localStorage.setItem("processedFrontImageDataURL", processedImageDataURL);
        setL1(data.dimA);
        setW1(data.dimB);

        // if (data.dimA * data.dimB * w2 * h1 !== 0) {
        //   calculateDims();
        // }
      } catch (error) {
        console.error('Error uploading images:', error);
      }
    }
  };

  const uploadSideViewImages = async () => {
    if (sideViewImage) {
      const formData = new FormData();
      formData.append('image', sideViewImage);
      const url = mode === "p" ? "http://47.238.184.88:1234" + "/measure" : "http://127.0.0.1:1234" + "/measure";

      try {
        const response = await fetch(url, {
          method: 'POST',
          // headers: {
          //   'Content-Type': 'multipart/form-data',
          //   // Add any additional headers if required
          // },
          body: formData,
        });

        const data = await response.json();
        const processedImageDataURL = `data:image/png;base64,${data.image}`;
        setProcessedSideView(processedImageDataURL);
        localStorage.setItem("processedSideImageDataURL", processedImageDataURL);
        setW2(data.dimA);
        setH1(data.dimB);

      } catch (error) {
        console.error('Error uploading images:', error);
      }
    }
  };

  return (
    <div className='flex flex-col items-center bg-hero-pattern bg-gray-400'>
      <NavBar name={usernameGlobal}></NavBar>
      <div className="bg-gray-900 text-white w-full">
        <div className="">
          <div className='flex flex-row items-center'>
            <h1 className='mx-4 my-1 flex-1'>Package Details</h1>
            <div className="relative inline-block mx-2">
              <button className="bg-gray-900 hover:bg-gray-900 mt-6" onClick={handleGoBackNavigation}>
                <h1>Go Back</h1>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="container image-uploader">
        <div className="upload-buttons flex flex-row">
          <div className='flex flex-col mx-2'>
            <input type="file" onChange={handleFrontViewChange} />
            <div className="image-container">
              <h2>Front View</h2>
              {processedFrontView && <img src={processedFrontView} width={640} height={480} alt="Processed Front View" />}
              <br></br>
              <button onClick={uploadFrontViewImages}>Upload Front View Images</button>
            </div>
          </div>
          <div className='flex flex-col mx-2'>
            <input type="file" onChange={handleSideViewChange} />
            <div className="image-container">
              <h2>Side View</h2>
              {processedSideView && <img src={processedSideView} width={640} height={480} alt="Processed Side View" />}
              <br></br>
              <div className='flex flex-col'>
                <button onClick={uploadSideViewImages}>Upload Side View Images</button>
                {(l1 * w1 * w2 * h1 != 0) && <button onClick={calculateDims}>Calculate Dimensions</button>}
                <button onClick={handleGoBackNavigation}>Back</button>
              </div>
            </div>
          </div>
          {showDims && <div className='flex flex-col mx-2 p-4'>
            {/* <h1>{l1}, {w1}, {w2}, {h1}</h1> */}
            <h1 className='p-4'>Dim 1: {dim[0].toFixed(1)}</h1>
            <h1 className='p-4'>Dim 2: {dim[1].toFixed(1)}</h1>
            <h1 className='p-4'>Dim 3: {dim[2].toFixed(1)}</h1>
          </div>}
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;