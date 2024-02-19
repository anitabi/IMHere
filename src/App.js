import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import React, { useState, useRef } from 'react';

function App() {
  const [firstImage, setFirstImage] = useState(null);
  const [secondImage, setSecondImage] = useState(null);
  const [mergedImageURL, setMergedImageURL] = useState('');
  const firstCanvasRef = useRef(null);
  const secondCanvasRef = useRef(null);


  const handleImageChange = (event, setImage, canvasRef) => {
    const file = event.target.files[0];
    setImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleFirstImageChange = (event) => {
    handleImageChange(event, setFirstImage, firstCanvasRef);
  };

  const handleSecondImageChange = (event) => {
    handleImageChange(event, setSecondImage, secondCanvasRef);
    if (firstImage) {
      mergeImages(firstImage, event.target.files[0]);
    }
  };



  const mergeImages = (firstImage, secondImage) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const firstImg = new Image();
    const secondImg = new Image();

    firstImg.onload = () => {
      canvas.width = Math.max(firstImg.width, secondImg.width);
      canvas.height = firstImg.height + secondImg.height;
      ctx.drawImage(firstImg, 0, 0);
      secondImg.onload = () => {
        ctx.drawImage(secondImg, 0, firstImg.height);
        setMergedImageURL(canvas.toDataURL('image/png'));
      };
      secondImg.src = URL.createObjectURL(secondImage);
    };
    firstImg.src = URL.createObjectURL(firstImage);
  };


  return (
    <div className="App">
      <div className="container">
        <header class="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
          <a href="#" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none">
            <span class="fs-4">I'm Here! 圣地巡礼对比图生成器</span>
          </a>
          <ul class="nav nav-pills">
            <li><button className="btn">About</button></li>
          </ul>
        </header>

        <div>
          <div className="row">
            <div className="col-md-5">
              <input type="file" onChange={handleFirstImageChange} />

            </div>
            <div className="col-md-4">
              <input type="file" onChange={handleSecondImageChange} disabled={!firstImage} />
            </div>

          </div>
          <div className="row">
            <div className="col-md-5">
              <canvas ref={firstCanvasRef}></canvas>

            </div>
            <div className="col-md-4">
              <canvas ref={secondCanvasRef}></canvas>
            </div>

          </div>
          <div className="row mt-5">
            <p class="h1">Results</p>

            {mergedImageURL && (
              <div>
                <img src={mergedImageURL} alt="Merged" style={{ maxWidth: '100%' }} />
              </div>
            )}
          </div>
          <div className="row mt-2">

            <a href={mergedImageURL} download="merged-image.png">Download Merged Image</a>

          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
