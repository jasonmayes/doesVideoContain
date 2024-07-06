# doesVideoContain

**The initial release of this little utility library allows you to ask the most common question when working with video content - does the video contain something you care about?**

Well now you can let AI do the watching with you and automatically grab screenshots for the moments that matter to you using plain english sentences to explain what you want as if it were your friend :-)

Even better this works entirely client side in the web browser as I’m using #WebAI to run the AI models, so that means once the webpage has downloaded, this can work entirely offline - protecting your privacy, and with no costly APIs to pay for! 

Furthermore, as you are working with local files that never get uploaded to a cloud server, that means you can even watch that 100GB MP4 on your hard drive and have it analyzed immediately without needing to wait several hours to upload it to some cloud service to do the same job. Amazing!


## Show me a demo

The below GIF was captured in Chrome on a PC with an NVIDIA 1070 in real time. Your mileage may vary depending on your GPU.

Keep an eye at the bottom of the capture where the screenshots of matched parts of the video are rendered:

![demo](https://github.com/jasonmayes/doesVideoContain/blob/main/demo.gif?raw=true)

Try it for yourself right now via my hosted CodePen demo below!

**Please note:**
* Your browser must support WebGPU (verified to work in Chrome).
* The first time you load the page it will download about 1GB of model files.
* Your second page load will be MUCH faster once model files are cached.

**Launch live Codepen demo:** [https://codepen.io/jasonmayes/pen/eYaqZZo](https://codepen.io/jasonmayes/pen/eYaqZZo)


## How do you use it?

As this is something I made in under a day, it's not a perfect interface as my focus was just getting an MVP working, so I welcome feedback and will likely improve this going forward. For now though it's real simple:

```
// Import this library - host the doesVideoContain.js file from this repo
// on your own server on the same domain (or enable CORS headers if not)
import {doesVideoContain} from "https://YOUR_PATH_TO/doesVideoContain.js";


/**
 * Now define 4 key DOM element IDs from your HTML it needs to work with:
 **/

// ID of an input box element that user will type what to search for.
const SEARCH_BOX = 'searchbox';

// ID of an input file picker element that user will use to select a video.
const UPLOADER = 'videoUpload';

// ID of a HTML element that this library will render the video into (e.g a DIV container).
const VIDEO_CONTAINER_ELEMENT = 'videoRenderer';

// ID of a HTML element where found results will be rendered to (e.g. a DIV container element).
const RESULTS_RENDER_ELEMENT = 'output';


// Advanced configuration object (optional):
const CONFIG = {
  task: '<CAPTION>',           // Select one of <CAPTION> <DETAILED_CAPTION> <MORE_DETAILED_CAPTION> <OCR>.
  videoMuted: false,           // Mute video boolean.
  videoDisableAutoplay: false, // Disable autoplay boolean.
  debugLogs: true,             // Log debug messages.
  minSimilarity: 0.35          // Minimum cosine similarity for screenshot to be captured.
};


// Alright, now just initialize the library and once loaded, 
// tell your user to select a video and it will automatically start capturing screenshots for matches.
doesVideoContain.init(SEARCH_BOX, UPLOADER, VIDEO_CONTAINER_ELEMENT, RESULTS_RENDER_ELEMENT, CONFIG, loaded);

// An example callback function to know when the library is loaded and ready to do work.
function loaded() {
  // This is where you can now do things and write your custom code.
}
```


## How is this possible?

This is possible thanks to the amazing Web AI ecosystem that has brought many popular AI models to the web browser. I aim to expand this to be more advanced in the future leveraging the wider ecosystem but this initial release is possible thanks to [Transformers.js](https://huggingface.co/docs/transformers.js/en/index) and [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/) combined with my own custom logic to perform cosine similarity from the embeddings produced by the AI models and various DOM processing/rendering.

### Acknowledgements

A huge thank you to [Xenvoa](https://twitter.com/xenovacom) over on Twitter for answering my questions around alpha Transformers.js usage at random hours of the morning when my mind was most active :-) He is an absolute legend and you should go follow his work too.


## Why did I make this?

I was just curious if I could pull this off or not in the web browser in real time on my NVIDIA 1070 - turns out you can!

If this repo gets enough interest I will continue adding features to it, so give it a star while you are here ;-)


## Got questions?

Please do connect and [reach out to me over on LinkedIn](https://www.linkedin.com/in/webai/) which is the most likely place to get a response.
