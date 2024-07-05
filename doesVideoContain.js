/**
 * Video.doesItContain() library powered by Web AI
 * By Jason Mayes 2024.
 *
 * Connect: https://www.linkedin.com/in/webai/
 * Learn Web AI: https://goo.gle/Learn-WebAI
 **/

import {pipeline, env, Florence2ForConditionalGeneration, AutoProcessor, AutoTokenizer, RawImage} from "https://assets.codepen.io/48236/transformers.min.js";

export const doesVideoContain = (function () {
  
  const VIDEO_ELEMENT = document.createElement('video');
  VIDEO_ELEMENT.setAttribute('width', '640');
  VIDEO_ELEMENT.setAttribute('height', '480');
  VIDEO_ELEMENT.setAttribute('autoplay', 'true');
  VIDEO_ELEMENT.setAttribute('controls', 'true');
   
  const CANVAS = document.createElement("canvas");
  const CTX = CANVAS.getContext("2d");
  const UL = document.createElement('ul');
  UL.setAttribute('class', 'jVidContainsResults');
  
  let searchBox = undefined;
  let targetDomRenderEl = undefined;
  let filePicker = undefined;
  
  let featureExtractor = undefined;
  let model = undefined;
  let processor = undefined;
  let tokenizer = undefined;
  
  let videoLoaded = false;
  let task = '<CAPTION>';
  let debug = false;
  let minCosineSimilarity = 0.35;
  let loadedCallback = undefined;
  
  
  async function loadModels() {
    featureExtractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    const model_id = 'onnx-community/Florence-2-base-ft';
    model = await Florence2ForConditionalGeneration.from_pretrained(model_id, { dtype: 'fp32', device: 'webgpu' });
    processor = await AutoProcessor.from_pretrained(model_id);
    tokenizer = await AutoTokenizer.from_pretrained(model_id);
    if (debug) {
      console.log('Models Loaded!');
    }
    if (loadedCallback) {
      loadedCallback();
    }
  }
  
  
  async function calcEmbedding(sentence) {
    let embeddings = await featureExtractor(sentence, {pooling: 'mean', normalize: true});
    return embeddings.data;
  }

  
  function dotProduct(a, b) {
    return a.reduce((sum, val, i) => sum + val * b[i], 0);
  }


  function magnitude(v) {
    return Math.sqrt(v.reduce((sum,val) => sum + val * val, 0));
  }


  // Higher values = more similar, lower values less similar.
  function calcCosineSimilarity(a, b) {
    return dotProduct(a, b) / (magnitude(a) * magnitude(b));
  }
  
  
  function calcEuclidDistance(a, b) {
    let sumOfSquares = 0;
    for (let i = 0; i < a.length; i++) {
      let diff = a[i] - b[i];
      sumOfSquares += diff * diff;
    }
    return Math.sqrt(sumOfSquares);
  }
  
  
  function handleUpload(event) {
    let blobURL = URL.createObjectURL(event.target.files[0]);
    VIDEO_ELEMENT.src = blobURL;
    videoLoaded = true;
  }
  
  
  async function classify() {
    CANVAS.width = VIDEO_ELEMENT.videoWidth;
    CANVAS.height = VIDEO_ELEMENT.videoHeight;

    CTX.drawImage(VIDEO_ELEMENT, 0, 0);
    let url = CANVAS.toDataURL('image/jpeg', 0.7);

    const image = await RawImage.fromURL(url);
    const vision_inputs = await processor(image);

    // Specify task and prepare text inputs
    const prompts = processor.construct_prompts(task);
    const text_inputs = tokenizer(prompts);

    // Generate text
    const generated_ids = await model.generate({
        ...text_inputs,
        ...vision_inputs,
        max_new_tokens: 100,
    });

    // Decode generated text
    const generated_text = tokenizer.batch_decode(generated_ids, { skip_special_tokens: false })[0];

    // Post-process the generated text
    const result = processor.post_process_generation(generated_text, task, image.size);
    let imgDesc = result[task];

    let embedding1 = await calcEmbedding(imgDesc);
    let embedding2 = await calcEmbedding(searchBox.value);

    // let distanceEuclid = calcDistance(embedding1, embedding2);
    let distanceCos = calcCosineSimilarity(embedding1, embedding2);

    if (debug) {
      console.log(distanceCos + " " + imgDesc);
    }
    
    if (distanceCos > minCosineSimilarity) {
      const LI = document.createElement('li');
      LI.setAttribute('class', 'jResult');

      const P = document.createElement('p');
      P.innerText = imgDesc;

      const IMG = document.createElement('img');
      IMG.src = url;
      IMG.width="240";
      LI.appendChild(IMG);
      LI.appendChild(P);
      UL.prepend(LI);
    }
  }
  
  async function classifyLoop() {
    try {
      if (videoLoaded) {
        await classify();
      }
    } catch (e) {
      console.error(e);
    }
    window.requestAnimationFrame(classifyLoop);
  }

  
  async function initiate(searchTextID, filePickerID, videoRenderElID, targetRenderElID, config, callback) {
    env.allowLocalModels = false;
    env.backends.onnx.wasm.proxy = false;
    
    searchBox = document.getElementById(searchTextID);
    filePicker = document.getElementById(filePickerID);
    filePicker.addEventListener('change', handleUpload);
    let videoRenderSpace = document.getElementById(videoRenderElID);
    videoRenderSpace.appendChild(VIDEO_ELEMENT);
    targetDomRenderEl = document.getElementById(targetRenderElID);
    targetDomRenderEl.appendChild(UL);

    // Set up advanced configuration.
    if (config) {
      task = config.task ? config.task : task;
      debug = config.debugLogs ? config.debugLogs : debug;
      VIDEO_ELEMENT.volume = config.videoMuted ? 0 : 1;
      config.videoDisableAutoplay ? VIDEO_ELEMENT.removeAttribute('autoplay') : VIDEO_ELEMENT.setAttribute('autoplay', 'true');
      minCosineSimilarity = config.minSimilarity ? config.minSimilarity : minCosineSimilarity;
    }
    
    if (callback) {
      loadedCallback = callback;
    }

    await loadModels();
    classifyLoop();
  }
  
  
  return {
    init: initiate
  };
})();

