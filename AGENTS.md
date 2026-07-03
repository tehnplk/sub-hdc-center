## RULE
- Do not  build and  deploy if user not request.

## DATABASE TOOL
- use `db-cli` skill to manipulate database.
- read database credential from .env

## TEST &  INVESTIGATION
- Use `playwright-cli` skill for testing or investigation.
    ### STEP
        1. `playwright-cli open http://localhost:3000` to start.
        2. `playwright-cli show` for  monitoring by user.
        3. `playwright-cli show --anotate` if user request anotate.
        4. while anotate progress wait user input.

## deploy
- @deploy_prod.md
    

