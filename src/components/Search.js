import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function s2ms(s) {
    const minutes = Math.floor(s / 60);
    const seconds = s % 60;
    return minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0');
}

function Search() {
    const [keyword, setKeyword] = useState('');
    const [results, setResults] = useState([]);
    const [points, setPoints] = useState([]);
    const timerId = useRef(null);

    const handleChange = (event) => {
        setKeyword(event.target.value);
    };

    const search = async () => {
        if (!keyword.trim()) return;

        try {
            const response = await axios.get(`https://api.bgm.tv/search/subject/${keyword}?type=2`);
            setResults(response.data.list);
        } catch (error) {
            console.error('搜索失败:', error);
        }
    };

    useEffect(() => {
        if (timerId.current) clearTimeout(timerId.current);
        timerId.current = setTimeout(() => {
            search();
        }, 500); // 500ms delay

        return () => clearTimeout(timerId.current);
    }, [keyword]);

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            clearTimeout(timerId.current);
            search();
        }
    };


    const handleSelect = async (id) => {
        setResults([]);

        try {
            const response = await axios.get(`https://anitabi.cn/api/bangumi/${id}/lite`);
            const updatedPoints = response.data.litePoints.map(point => ({
                ...point,
                image: point.image.replace('h160', 'h360')
            }));

            console.log('Points data', updatedPoints);
            setPoints(updatedPoints);

        } catch (error) {
            console.error('Failed:', error);
        }

    };

    const handleSelectScreenshot = async (id) => { };


    return (
        <div className="Search container my-3">
            <div class="row mb-2"><input
                type="text"
                className="form-control"
                value={keyword}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="输入作品名"
            />
            </div>

            <div class="row">
                {results.length > 0 && (
                    <div className="list-group">
                        {results.map((item) => (
                            <div key={item.id} className="list-group-item list-group-item-action d-flex gap-3 py-3 align-items-center" aria-current="true">
                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="d-flex align-items-center text-decoration-none">
                                    <img src={item.images.common} alt={item.name} className="d-flex align-self-center me-3" style={{ width: '64px', height: '64px' }} />
                                    <div>
                                        <h6 className="mb-0">{item.name_cn || item.name}</h6>
                                        <p className="mb-0 opacity-75">{item.name}</p>
                                        <p className="mb-0 opacity-75">{item.id}</p>
                                    </div>
                                </a>
                                <div className="ms-auto">
                                    <button type="button" className="btn btn-outline-primary" onClick={(e) => { e.stopPropagation(); handleSelect(item.id); }}>选择</button> {/* 修改后的按钮 */}
                                </div>
                            </div>
                        ))}

                    </div>
                )}

                {points.length > 0 && (
                    <div className="row row-cols-1 row-cols-md-3 g-4">
                        {points.map((point) => (
                            <div key={point.id} className="col">
                                <div className="card">
                                    <img src={point.image} className="card-img-top" alt={point.cn || point.name} />
                                    <div className="card-body">

                                        <div className="row">
                                            <div className="col-7">
                                                <h5 className="card-title">{point.cn || point.name}</h5>
                                                <p className="card-text">EP{point.ep} {s2ms(point.s)} </p>
                                            </div>
                                            <div className="col-5 d-flex align-items-center justify-content-end">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary"
                                                    onClick={() => handleSelectScreenshot(point.id)}
                                                >
                                                    选择截图
                                                </button>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Search;
