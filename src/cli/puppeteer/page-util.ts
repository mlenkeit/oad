import * as puppeteer from 'puppeteer'

export default (page: puppeteer.Page) => {
  const $text = async (selector: string): Promise<string> => {
    const elementHandle = await page.$(selector)
    const text = await page.evaluate(elementHandle => elementHandle.textContent, elementHandle)
    return text
  }

  const $$text = async (selector: string): Promise<string[]> => {
    const elementHandles = await page.$$(selector)
    const texts = await Promise.all(elementHandles.map(async elementHandle => {
      const text = await page.evaluate(elementHandle => elementHandle.textContent, elementHandle)
      return text
    }))
    return texts
  }

  return {
    $text,
    $$text
  }
}