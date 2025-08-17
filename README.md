<!-- <div align="center">
  <img src="./assets/datalore_logo.png" alt="Datlore.ai" />
</div>
<br/>
<br/>
<div align="center">
  <img src="./assets/deep_research.gif" alt="Deep Research Demo" />
</div> -->
# Doc-Sailor

## Overview

**Doc Sailor** is a browser extension built to search and explore documentation across entire sites using advanced hybrid search, not just the page you are on. Enter what you need and it uses semantic understanding to scan linked pages, subpages and related resources to uncover exact matches or closely related information. Doc Sailor helps you quickly discover where the answers live, saving you from tedious manual navigation through dense content.



## Getting Started

Follow these steps to set up and run the project locally.

### 1. Clone the Repository

Clone the repository:

```bash
git clone <repository-url>
cd project
```

## Backend Setup

### 2. Navigate to Backend Directory

```bash
cd backend
```

### 3. Set Up Environment Variables

Copy the example `.env` file:

```bash
cp .env.example .env
```

Open the `.env` file in a text editor and fill in the required values:

```
MISTRAL_API_KEY=your_mistral_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# default
QDRANT_URL=http://qdrant:6333
COLLECTION_NAME=knowledge_base
EMBEDDING_MODEL=BAAI/bge-small-en-v1.5
DENSE_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
BM25_EMBEDDING_MODEL=Qdrant/bm25
LATE_INTERACTION_EMBEDDING_MODEL=colbert-ir/colbertv2.0
```

### 4. Start the Backend

Run the backend using Docker:

```bash
docker-compose up --build
```


## Frontend Setup

### 5. Navigate to Frontend Directory

```bash
cd ../frontend
```

### 6. Set Up Environment Variables

Copy the example `.env` file:

```bash
cp .env.example .env
```

Open the `.env` file in a text editor and set the API URL:

```
VITE_API_URL=http://localhost:8000
```

### 7. Install Frontend Dependencies

```bash
npm install
```

### 8. Build the Frontend

```bash
npm run build
```

After building, you will find the `/dist` folder in the root of the frontend directory.

### 9. Load the Extension in Chrome

To load your built frontend as an unpacked extension:

1. Go to the Extensions page in Chrome by entering `chrome://extensions` in a new tab. (Note: Chrome's `chrome://` URLs aren’t linkable.)  
2. Alternatively, you can click the Extensions puzzle icon → select **Manage Extensions**, or open the Chrome menu → **More Tools** → **Extensions**.  
3. Enable **Developer mode** using the toggle switch at the top-right.  
4. Click **Load unpacked** and select the `dist` folder from your frontend directory.

For more detailed guidance and context, check out the official Chrome Developers tutorial “Hello World” here:
https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world


You're all set!  
Backend is running via Docker, and the frontend is built and ready to use.


##  Authors
 
- [Swaraj Biswal](https://github.com/SWARAJ-42)
- [Swadhin Biswal](https://github.com/swadhin505) 


## Contributing

If something here could be improved, please open an issue or submit a pull request.

### License

This project is licensed under the MIT License. See the `LICENSE` file for more details.


