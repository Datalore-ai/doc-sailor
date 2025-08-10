import asyncio
import json
from concurrent.futures import ThreadPoolExecutor

from crawl4ai import AsyncWebCrawler, CrawlerRunConfig
from crawl4ai.content_scraping_strategy import LXMLWebScrapingStrategy

from repository.agents.chore_agents import extract_internal_links, safe_extract_main_content
from repository.qdrant_setup import rag_pipeline_setup

# Initialize crawler and config once
crawler = AsyncWebCrawler()
config = CrawlerRunConfig(
    scraping_strategy=LXMLWebScrapingStrategy(),
    verbose=True,
)

# Reusable thread pool
executor = ThreadPoolExecutor()

async def run_in_thread(fn, *args):
    """Utility to run blocking functions in a thread."""
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(executor, fn, *args)

async def crawl_webpage(url: str, filter=True):
    """Crawl a webpage and return both raw and processed markdown content."""
    result = await crawler.arun(url, config=config)
    if filter == True:
        processed_text = safe_extract_main_content(result.markdown)
    else: 
        processed_text = result.markdown
    return result.markdown, processed_text

async def setup_vectordb(session_id, links: list[str]):
    """Crawl multiple links and use the generation agent to build a dataset."""
    crawl_tasks = [crawl_webpage(link, False) for link in links]
    results = await asyncio.gather(*crawl_tasks)
    documents = [ page_content for _, page_content in results]
    rag_pipeline_setup(session_id, links, documents)

async def documentation_setup(session_id, url):
    yield "data: 🌐 Crawling homepage...\n\n"
    homepage_raw_markdown, _ = await crawl_webpage(url)
    await asyncio.sleep(0.5)

    yield "data: 🔗 Extracting internal links...\n\n"
    all_navigation_links = extract_internal_links(homepage_raw_markdown)
    await asyncio.sleep(0.5)

    yield f"data: 📚 Found {len(all_navigation_links)} links. Setting up database...\n\n"
    await setup_vectordb(session_id, all_navigation_links)
    await asyncio.sleep(0.5)

    yield f"data: ✅ Setup Complete\n\n"

if __name__ == "__main__":
    asyncio.run(documentation_setup(session_id='1', url = "https://docs.crawl4ai.com/"))