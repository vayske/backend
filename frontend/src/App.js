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

function ModifyImage({ files, setTags }) {
  const [index, setIndex] = useState(0);
  let imageMap = useRef({});
  let tag = useRef("");

  const nextImage = () => {
    const tagArray = tag.current.value.split(/[\s,]+/);
    tag = "";

    tagArray.forEach(element => {
      if (!imageMap.current[element]) {
        imageMap.current[element] = [files[index]];
      } else if (!imageMap.current[element].includes(files[index])) {
        imageMap.current[element].push(files[index]);
      }
    });

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

function App() {
  const [images, setImages] = useState([]);
  let tags = useRef({});

  const saveTags = (imageTags) => {
    tags.current = imageTags;
    setImages([]);
  }

  console.log(tags.current);

  if (images.length === 0) {
    return (
      <>
        <h1>吊图管理工具</h1>
        <DragDropFile handleFile={setImages}/>
      </>
    );
  } else if (images.length > 0){
    return (
      <ModifyImage files={images} setTags={saveTags}/>
    );
  }
}

export default App;
