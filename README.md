

## Getting Started



Preqrequisites:
Install Git:
1. If Git is not already installed on your computer, you need to download and install it. You can download it from git-scm.com.
2. On the repository page, locate the "Code" button. Click it, and you'll see an option to clone the repository using HTTPS, SSH, or GitHub CLI. Select the method that suits your setup. For most users, HTTPS is straightforward and easy to use.
Click on the clipboard icon to copy the repository URL.
3. Open Terminal or Command Prompt: On your computer, open your terminal (Linux or macOS) or command prompt (Windows). Navigate to the directory where you want to clone the repository using the cd command (e.g., cd Documents/Projects). Clone the Repository: Type the following command and replace <URL> with the URL you copied:
git clone <URL>
Press Enter. Git will start cloning the repository to your local machine. This process may take some time depending on the size of the repository.

Install Node:
1. Install Volta, type 'iwr https://get.volta.sh | iex' in cmd.
2. Restart CMD or your shell
3. Type 'volta install node@20.11.1' in cmd.
4. Verify the installation by typing 'node -v', if you see 21.11.1, then it is correctly install;


Setting up:

1. Change director to the video-conference app.
2. In the root folder, type 'npm install'
3. After, type 'npm i -g vercel@latest', then 'vercel link' in the cmd to connect to vercel postgresql database
4. Try running 'npx prisma studio'
5. Then, run 'npm run dev'

