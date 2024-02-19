import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import React, { useState } from 'react';

function App() {
  const [firstImage, setFirstImage] = useState(null);
  const [secondImage, setSecondImage] = useState(null);
  const [mergedImageURL, setMergedImageURL] = useState('');

  const handleFirstImageChange = (event) => {
    setFirstImage(event.target.files[0]);
  };

  const handleSecondImageChange = (event) => {
    const file = event.target.files[0];
    setSecondImage(file);
    if (firstImage) {
      mergeImages(firstImage, file);
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
            <span class="fs-4">I'm here 圣地巡礼对比图生成器</span>
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
            {mergedImageURL && (
              <div>
                <img src={mergedImageURL} alt="Merged" style={{ maxWidth: '100%' }} />
              </div>
            )}
          </div>
          <div className="row">
            <a href={mergedImageURL} download="merged-image.png">Download Merged Image</a>

          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
