export const shortenUrl = async (longUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("https://tinyurl.com/abcd1234");
      }, 1000);
    });
  };
