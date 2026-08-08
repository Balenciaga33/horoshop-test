import { expect, test } from '../../fixtures/checkout.fixtures';
import validation from '../../data/checkout.validation.data.json';

const recipient = validation.recipient;

test.describe('Checkout: валідація форми', () => {
  test(
    'Порожній checkout — кнопка оформлення неактивна',
    { tag: '@p0' },
    async ({ onCheckout }) => {
      await test.step('Перевірити disabled submit без заповнення', async () => {
        await onCheckout.expectSubmitDisabled();
        await expect(onCheckout.nameInput).toHaveValue('');
        await expect(onCheckout.phoneInput).toHaveValue('');
        await expect(onCheckout.emailInput).toHaveValue('');
      });
    },
  );

  test(
    'Неповний телефон — кнопка оформлення лишається неактивною',
    { tag: '@p1' },
    async ({ onCheckout }) => {
      await test.step('Заповнити ПІБ, місто, email і неповний телефон', async () => {
        await onCheckout.fillName(recipient.name);
        await onCheckout.selectCity(recipient.cityQuery);
        await onCheckout.fillEmail(recipient.validEmail);
        await onCheckout.typePhoneDigits(validation.incompletePhoneDigits);
      });

      await test.step('Submit лишається disabled', async () => {
        await onCheckout.expectSubmitDisabled();
      });
    },
  );

  for (const invalidEmail of validation.invalidEmails) {
    test(
      `Невалідний email "${invalidEmail}" — HTML5 помилка і замовлення не відправляється`,
      { tag: '@p1' },
      async ({ onCheckout }) => {
        await test.step('Заповнити форму з невалідним email', async () => {
          await onCheckout.fillRecipient({
            name: recipient.name,
            phoneMasked: recipient.phoneMasked,
            cityQuery: recipient.cityQuery,
            email: invalidEmail,
          });
        });

        await test.step('Перевірити HTML5-валідацію email', async () => {
          await onCheckout.expectEmailInvalid();
        });

        await test.step('Спроба submit не змінює URL checkout', async () => {
          // Нативна HTML5-валідація може лишати кнопку enabled або ні — клікаємо, якщо можна.
          if (await onCheckout.submitButton.isEnabled()) {
            await onCheckout.submitOrder();
          } else {
            await onCheckout.expectSubmitDisabled();
          }
          await onCheckout.expectStillOnCheckout();
          await onCheckout.expectEmailInvalid();
        });
      },
    );
  }

  test(
    'Валідний email проходить HTML5-перевірку після невалідного',
    { tag: '@p1' },
    async ({ onCheckout }) => {
      await onCheckout.fillRecipient({
        name: recipient.name,
        phoneMasked: recipient.phoneMasked,
        cityQuery: recipient.cityQuery,
        email: validation.invalidEmails[0],
      });
      await onCheckout.expectEmailInvalid();

      await onCheckout.fillEmail(recipient.validEmail);
      await expect
        .poll(async () =>
          onCheckout.emailInput.evaluate((el: HTMLInputElement) => el.checkValidity()),
        )
        .toBe(true);
      await onCheckout.expectSubmitEnabled();
    },
  );

  test(
    'Порожнє ПІБ при заповнених інших полях — submit може лишатися активним (поточна поведінка сайту)',
    { tag: '@p1' },
    async ({ onCheckout }) => {
      await onCheckout.fillRecipient({
        name: recipient.name,
        phoneMasked: recipient.phoneMasked,
        cityQuery: recipient.cityQuery,
        email: recipient.validEmail,
      });
      await onCheckout.expectSubmitEnabled();

      await onCheckout.fillName('');
      // Horoshop не вважає ПІБ HTML5-required для активації submit.
      await onCheckout.expectSubmitEnabled();
      await expect(onCheckout.nameInput).toHaveValue('');
    },
  );
});
