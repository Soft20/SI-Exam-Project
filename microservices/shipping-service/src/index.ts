import express from 'express';
import EurekaClient from './eureka';
import EnvError from './errors/EnvError';
import dotenv from 'dotenv';

import { Builder, By, Key, ThenableWebDriver, until, WebDriver, WebElement } from 'selenium-webdriver'
import { Driver, Options } from 'selenium-webdriver/firefox';
import handleError from './utils/handleError';
import ShippingServiceError from './errors/ShippingServiceError';


dotenv.config();

const PN_URL = `https://portal.postnord.com/onlineporto/`

const PORT: number | undefined = Number(process.env.PORT);
if (PORT == undefined) throw new EnvError('PORT');

const app = express();

app.get('', async (req, res) => {
	try {
		const weightsString: string = String(req.query.weights || "")

		if (!weightsString || weightsString.length === 0) {
			throw new ShippingServiceError("Please define some weights in params!")
		}

		let weights: number[] = weightsString.split(",").map(w => Number(w))

		const weightPrices: any = {}

		for (let weight of weights) {
			if (!weight) throw new ShippingServiceError(`Bad weight`)
			if (weight < 50) weight = 50
			weightPrices[weight] = null
		}

		let builder = new Builder().forBrowser("firefox")
		builder = builder.setFirefoxOptions(new Options().headless())

		let driver: WebDriver = await builder.build();

		try {

			await driver.get(PN_URL)

			try {
				console.log('Detecting cookie consent...')
				await driver.wait(until.elementsLocated(By.id("onetrust-accept-btn-handler")), 10000);
				await (await driver.findElement(By.id("onetrust-accept-btn-handler"))).click()
				console.log('Consented to cookie')
			} catch (e) {
				console.error("No cookie to consent")
			}

			for (const weight in weightPrices) {
				console.log('weight:', weight, "g")

				const weightField: WebElement = await driver.findElement(By.id("dkSliderWeightInput"))
				await weightField.sendKeys(Key.BACK_SPACE, Key.BACK_SPACE, Key.BACK_SPACE, Key.BACK_SPACE)
				await weightField.sendKeys(String(weight), Key.ENTER)

				await timeout(500)

				if (Number(weight) <= 250) {
					await chooseShippingType("Brev", driver)
				} else {
					await chooseShippingType("Pakke", driver)
				}

				await timeout(500)


				const priceField: WebElement = await driver.findElement(By.className("product-price__price__value"))
				const price: string = await priceField.getText()

				console.log('price:', price, "DKK")

				weightPrices[weight] = Number(price)
			}

			res.setHeader("currency", "DKK")
			res.send(weightPrices)

		} catch (e) {
			throw new ShippingServiceError("Something went wrong when scraping the service!")
		} finally {
			await driver.quit()
		}
	} catch (e) {
		handleError(e, res)
	}
});

app.listen(PORT, async () => {
	try {
		await EurekaClient.start();
	} catch (error) {
		console.log(error.message);
		process.exit();
	}
});

async function chooseShippingType(shippingTypeName: string, driver: WebDriver) {
	const shippingTypes: WebElement[] = await driver.findElements(By.tagName("dk-product-list-product"))

	for (const shippingType of shippingTypes) {
		const h3Element: WebElement = await shippingType.findElement(By.className("ng-binding"))
		const type: string = await h3Element.getText()
		if (type === shippingTypeName) {
			// console.log('loc', h3Element.getLocation())
			await driver.wait(until.elementIsVisible(shippingType), 10000)
			await driver.wait(until.elementIsEnabled(shippingType), 10000)
			await shippingType.click()
			break
		}
	}
}

function timeout(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
