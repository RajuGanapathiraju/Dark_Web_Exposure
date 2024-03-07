# Dark_Web_Exposure

This Node.js script is designed to search for specified keywords on the dark web using torch dark web search engine. It utilizes Tor for anonymity and Cheerio for web scraping.

## Prerequisites
Before using this script, make sure you have the following dependencies installed:

1. Node.js

2. Tor

3. NPM packages: tor-request, cheerio, fs, async, colors

## Installation

Clone the repository:

```bash
git clone https://github.com/your-username/dark-web-keyword-search.git
```

## Install dependencies:

```bash
npm install
```

Ensure Tor is running on your system.

## Usage
Modify the keywords array in the index.js file to include the keywords you want to search for on the dark web.

```bash
const keywords = ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"];
```

To run the script, execute:

```bash
node index.js
```

The script will iterate through each keyword, retrieve a token from torch dark web search engine, perform the search, and save the results to HTML files.

##Notes
Ensure you have Tor configured properly for anonymous browsing.
This script is for educational purposes only. Use it responsibly and ethically.

