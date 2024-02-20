import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import React, { useState, useRef, useEffect } from 'react';

// function to add text
function addTextToCanvas(canvas, text, x, y, size, color) {
  const ctx = canvas.getContext('2d');
  ctx.font = `${size}px UDDigiKyokashoR`;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function App() {
  const [firstImage, setFirstImage] = useState(null);
  const [secondImage, setSecondImage] = useState(null);
  const [mergedImageURL, setMergedImageURL] = useState('');
  const [posInfo, setPosInfo] = useState({ "name": "JR 町田駅南口", "anime": "ギヴン", "episode": 5, "time": 502, "x": 35.542906, "y": 139.4449 });
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
      secondImg.onload = () => {
        // size calculation
        const textMargin = firstImg.height * 0.1;
        const textSize = firstImg.height * 0.03;

        canvas.width = firstImg.width;
        canvas.height = firstImg.height * 2.15;
        // set canvas bgc
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 现在绘制两个图像
        ctx.drawImage(firstImg, 0, 0);
        ctx.drawImage(secondImg, 0, firstImg.height);

        // 计算文本位置，使其居中并位于图片下方
        const textX = canvas.width / 2;
        const textY = firstImg.height + secondImg.height + textMargin;
        // 绘制文本
        addTextToCanvas(canvas, posInfo.name, textX, textY, textSize, '#000000');
        setMergedImageURL(canvas.toDataURL('image/png'));
      };
      // 设置secondImg.src在firstImg.onload内部，但要在secondImg.onload之后
      secondImg.src = URL.createObjectURL(secondImage);
    };
    // 确保firstImg.onload定义完成后设置firstImg的src
    firstImg.src = URL.createObjectURL(firstImage);
  };

  useEffect(() => {
    const font = new FontFace('UDDigiKyokashoR', 'url(./UDDigiKyokashoN-R.ttc)');
    font.load().then((loadedFont) => {
      document.fonts.add(loadedFont);
      console.log('Font loaded');
    }).catch(error => console.log('Font loading error:', error));
  }, []); // 空依赖数组表示这个effect仅在组件挂载时运行一次


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
            <div className="col-md-5">
              <input type="file" onChange={handleSecondImageChange} disabled={!firstImage} />
            </div>

          </div>
          <div className="row">
            <div className="col-md-5">
              <canvas ref={firstCanvasRef} style={{ maxWidth: '70%' }} ></canvas>

            </div>
            <div className="col-md-5">
              <canvas ref={secondCanvasRef} style={{ maxWidth: '70%' }}></canvas>
            </div>

          </div>
          <div className="row mt-5">
            <p class="h1">Results</p>

            {mergedImageURL && (
              <div>
                <img src={mergedImageURL} alt="Merged" style={{ maxWidth: '50%' }} />
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
