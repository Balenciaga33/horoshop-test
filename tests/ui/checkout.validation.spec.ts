import { expect, test } from '../../fixtures/base.fixtures';
import products from '../../data/products.data.json';
import validation from '../../data/checkout.validation.data.json';

const product = products.gentleSkinCleanser;
const recipient = validation.recipient;

async function openCheckoutWithProduct(
  productPage: { open: (slug: string) => Promise<void>; addToCart: () => Promise<void> },
  cartPage: { goToCheckout: () => Promise<void> },
  checkoutPage: { expectLoaded: () => Promise<void> },
): Promise<void> {
  await productPage.open(product.slug);
  await productPage.addToCart();
  await cartPage.goToCheckout();
  await checkoutPage.expectLoaded();
}

test.describe('Checkout: валідація форми', () => {
  test(
    'Порожній checkout — кнопка оформлення неактивна',
    { tag: '@p0' },
    async ({ productPage, cartPage, checkoutPage }) => {
      await openCheckoutWithProduct(productPage, cartPage, checkoutPage);

      await test.step('Перевірити disabled submit без заповнення', async () => {
        await checkoutPage.expectSubmitDisabled();
        await expect(checkoutPage.nameInput).toHaveValue('');
        await expect(checkoutPage.phoneInput).toHaveValue('');
        await expect(checkoutPage.emailInput).toHaveValue('');
      });
    },
  );

  test(
    'Неповний телефон — кнопка оформлення лишається неактивною',
    { tag: '@p1' },
    async ({ productPage, cartPage, checkoutPage }) => {
      await openCheckoutWithProduct(productPage, cartPage, checkoutPage);

      await test.step('Заповнити ПІБ, місто, email і неповний телефон', async () => {
        await checkoutPage.fillName(recipient.name);
        await checkoutPage.selectCity(recipient.cityQuery);
        await checkoutPage.fillEmail(recipient.validEmail);
        await checkoutPage.typePhoneDigits(validation.incompletePhoneDigits);
      });

      await test.step('Submit лишається disabled', async () => {
        await checkoutPage.expectSubmitDisabled();
      });
    },
  );

  for (const invalidEmail of validation.invalidEmails) {
    test(
      `Невалідний email "${invalidEmail}" — HTML5 помилка і замовлення не відправляється`,
      { tag: '@p1' },
      async ({ productPage, cartPage, checkoutPage }) => {
        await openCheckoutWithProduct(productPage, cartPage, checkoutPage);

        await test.step('Заповнити форму з невалідним email', async () => {
          await checkoutPage.fillRecipient({
            name: recipient.name,
            phoneMasked: recipient.phoneMasked,
            cityQuery: recipient.cityQuery,
            email: invalidEmail,
          });
        });

        await test.step('Перевірити HTML5-валідацію email', async () => {
          await checkoutPage.expectEmailInvalid();
        });

        await test.step('Спроба submit не змінює URL checkout', async () => {
          // Native constraint validation may keep button enabled or not — click when possible.
          if (await checkoutPage.submitButton.isEnabled()) {
            await checkoutPage.submitOrder();
          } else {
            await checkoutPage.expectSubmitDisabled();
          }
          await checkoutPage.expectStillOnCheckout();
          await checkoutPage.expectEmailInvalid();
        });
      },
    );
  }

  test(
    'Валідний email проходить HTML5-перевірку після невалідного',
    { tag: '@p1' },
    async ({ productPage, cartPage, checkoutPage }) => {
      await openCheckoutWithProduct(productPage, cartPage, checkoutPage);

      await checkoutPage.fillRecipient({
        name: recipient.name,
        phoneMasked: recipient.phoneMasked,
        cityQuery: recipient.cityQuery,
        email: validation.invalidEmails[0],
      });
      await checkoutPage.expectEmailInvalid();

      await checkoutPage.fillEmail(recipient.validEmail);
      await checkoutPage.expectEmailValid();
      await checkoutPage.expectSubmitEnabled();
    },
  );

  test(
    'Порожнє ПІБ при заповнених інших полях — submit може лишатися активним (поточна поведінка сайту)',
    { tag: '@p1' },
    async ({ productPage, cartPage, checkoutPage }) => {
      await openCheckoutWithProduct(productPage, cartPage, checkoutPage);

      await checkoutPage.fillRecipient({
        name: recipient.name,
        phoneMasked: recipient.phoneMasked,
        cityQuery: recipient.cityQuery,
        email: recipient.validEmail,
      });
      await checkoutPage.expectSubmitEnabled();

      await checkoutPage.fillName('');
      // Horoshop does not treat name as HTML5-required for enabling submit.
      await checkoutPage.expectSubmitEnabled();
      await expect(checkoutPage.nameInput).toHaveValue('');
    },
  );
});
