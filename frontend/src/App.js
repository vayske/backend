import React, { useState, useRef } from "react";

function DragDropFile({ handleFile }) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files[0]) {
      const files = Array.prototype.slice.call(e.dataTransfer.files);
      handleFile(files);
    }
  }

  const handleInput = e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target.files[0]) {
      const files = Array.prototype.slice.call(e.target.files);
      handleFile(files);
    }
  }

  return (
    <form id="form-file-upload" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
      <input ref={inputRef} type="file" id="input-file-upload" onChange={handleInput} accept="image/gif,image/png,image/jpg,image/jpeg" multiple />
      <label id="label-file-upload" htmlFor="input-file-upload" className={dragActive ? "drag-active" : ""}>
        <div>
          <p>Drag and drop your files here</p>
          <p>or</p>
          <p>Click to upload files</p>
        </div>
      </label>
      { dragActive && <div id="drag-file-element" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div> }
    </form>
  );
};

function MainMenu({ setState }) {
  const [saveClick, setSaveClick] = useState(false);
  const [searchClick, setSearchClick] = useState(false);

  const handleMouseDown = e => {
    if (e.target.closest("#label-button[for=input-save-stamps]")) {
      setSaveClick(true);
    } else if (e.target.closest("#label-button[for=input-search-stamps]")) {
      setSearchClick(true);
    }
  }

  const handleMouseUp = e => {
    if (e.target.closest("#label-button[for=input-save-stamps]")) {
      setSaveClick(false);
    } else if (e.target.closest("#label-button[for=input-search-stamps]")) {
      setSearchClick(false);
    }
  }

  const handleChange = e => {
    if (e.target.closest("#label-button[for=input-save-stamps]")) {
      setState("save");
    } else if (e.target.closest("#label-button[for=input-search-stamps]")) {
      setState("search");
    }
  }

  return (
    <div id="main-menu">
      <div id="title">
        <h1 id="main-title">Meme Tool</h1>
      </div>
      <div id="menu-button">
        <input type="button" id="input-save-stamps" />
        <label id="label-button" htmlFor="input-save-stamps" onClick={handleChange} onMouseLeave={handleMouseUp} onMouseDownCapture={handleMouseDown} onMouseUpCapture={handleMouseUp} className={saveClick ? "menu-click" : "menu-idle"  }>
          <p>Save Stamps</p>
        </label>
        <input type="button" id="input-search-stamps" />
        <label id="label-button" htmlFor="input-search-stamps" onClick={handleChange} onMouseLeave={handleMouseUp} onMouseDownCapture={handleMouseDown} onMouseUpCapture={handleMouseUp} className={searchClick ? "menu-click" : "menu-idle" }>
          <p>Search Stamps</p>
        </label>
      </div>
    </div>
  );
};

function ModifyImage({ files, setTags }) {
  const [index, setIndex] = useState(0);
  let imageMap = useRef({});
  let tag = useRef("");

  const nextImage = () => {
    if (!imageMap.current[tag.current.value]) {
      imageMap.current[tag.current.value] = [files[index]];
    } else {
      imageMap.current[tag.current.value].push(files[index]);
    }


    if (index < files.length - 1) {
      setIndex(index + 1);
    } else {
      setTags(imageMap.current);
    }
  }

  if (index < files.length) {
    const imageUrl = URL.createObjectURL(files[index]);
    return (
      <div id="image-process">
        <img src={imageUrl} alt={imageUrl}/>
        <input ref={tag} type="text" id="image-tag"/>
        <button id="next-button" onClick={nextImage}>Next</button>
      </div>
    );
  }
}

function SearchImage({ resetAll }) {
  const [result, setResult] = useState([]);
  let tagRef = useRef("");

  const handleClick = () => {
    if (tagRef.current.value) {
      fetch('http://192.168.1.10:8080/search?' + new URLSearchParams({tags: tagRef.current.value}), {
        method: 'GET'
      }).then(response => response.text())
        .then(text => {
          setResult(text.split('\n'));
        });
    }
  }

  const handleDone = () => {
    resetAll();
  }

  if (result.length == 0) {
    return (
      <div id="search-images">
        <input ref={tagRef} type="text" id="image-tag"/>
        <button id="next-button" onClick={handleClick}>Search</button>
      </div>
    );
  } else {
    console.log(result);
    return (
      <div id="search-result">
        <p id="result-text">{result}</p>
        <button id="result-done" onClick={handleDone}>Done</button>
      </div>
    );
  }
}

function UploadToServer({ tags, setResult }) {
  const imageList = [];

  const uploadStart = () => {
    const fd = new FormData();
    for (const tag in tags) {
      for (const file of tags[tag]){
        fd.append(tag, file);
      }
    }
    fetch('http://192.168.1.10:8080/upload', {
      method: 'POST',
      body: fd,
    }).then(response => response.text())
    .then(text => setResult(text));
  }

  for (const tag in tags) {
    for (const file of tags[tag]) {
      imageList.push(
        <li key={file.name}>
          <img src={URL.createObjectURL(file)} />
          <p>{tag}</p>
        </li>
      )
    }
  }

  return (
    <div id="image-list">
      <ul>{imageList}</ul>
      <button id="upload-button" onClick={uploadStart}>Upload</button>
    </div>
  );
}

function ShowResult({ respText, resetAll }) {
  const handleClick = () => {
    resetAll();
  }
  return (
    <div id="result">
      <p id="result-text">{respText}</p>
      <button id="result-done" onClick={handleClick}>Done</button>
    </div>
  )
}

function App() {
  const [state, setState] = useState("idle");
  let images = useRef([]);
  let tags = useRef({});
  let respText = useRef("");

  const setImages = files => {
    images.current = files.slice();
    setState('modify');
  }

  const saveTags = imageTags => {
    tags.current = imageTags;
    setState("upload");
  }

  const setResult = result => {
    respText.current = result;
    setState("result");
  }

  const resetAll = () => {
    images.current = [];
    tags.current = {};
    respText.current = "";
    setState("idle");
  }

  switch (state) {
    case "idle":
      return (
        <>
          <MainMenu setState={(state) => setState(state)} />
        </>
      );
    case "search":
      return (
        <>
          <SearchImage resetAll={resetAll}/>
        </>
      )
    case "save":
      return (
        <>
          <h1>表情包管理工具</h1>
          <DragDropFile handleFile={setImages}/>
        </>
      );
    case "modify":
      return (
        <ModifyImage files={images.current} setTags={saveTags} />
      );
    case "upload":
      return(
        <UploadToServer tags={tags.current} setResult={setResult} />
      );
    case "result":
      return (
        <ShowResult respText={respText.current} resetAll={resetAll} />
      );
  }
}

export default App;
