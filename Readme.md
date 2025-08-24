# Backend.API.ExpressJS

---

### Setup Project In Your PC:

1. Cloning project:
   ```
   git clone https://github.com/ThisIsTheWizard/Backend.API.ExpressJS.git
   ```
2. Installing modules:
   ```
   npm i
   ```
3. Add environments:
   - Create a new .env file from .env.sample
4. Run server:
   ```
   npm run dev
   ```

---

### Project structure:

1. Root folder: `src/`
2. Main API server file: `src/server.js`
3. Middlewares: `src/middlewares/`
   - Authorizer: `authorizer.js`
   - Error: `error.js`
   - Index: `index.js`
4. Modules: `src/modules/`
   - Controllers: `controllers.js`
   - Entities: `entities.js`
   - Helpers: `helpers.js`
   - Routers: `routers.js`
   - Services: `services.js`
   - Module will have the files as follows:
     - i. `<module>.controller.js`
     - ii. `<module>.entity.js`
     - iii. `<module>.helper.js`
     - iv. `<module>.router.js`
     - v. `<module>.service.js`
5. Routes: `src/routes/`
6. Utils: `src/utils/`
   - AWS:
     - Cognito: `aws/cognito-service.js`
     - SES: `aws/simple-email-service.js`
     - S3: `aws/simple-storage-service.js`
   - Database:
     - Index: `database/index.js`
     - Transaction: `database/transaction.js`
   - Error: `error/index.js`

---

### Module importing rules:

- Must import with `src/*/*/*`
- Import with `../` is not allowed
- Must import by following ascending order
