import os

def save_env_var(key: str, value: str, env_file: str = ".env"):
    """
    Save or update an environment variable in a .env file.
    """
    lines = []
    if os.path.exists(env_file):
        with open(env_file, "r") as f:
            lines = f.readlines()

    key_exists = False
    with open(env_file, "w") as f:
        for line in lines:
            if line.startswith(f"{key}="):
                f.write(f'{key}="{value}"\n')  # overwrite
                key_exists = True
            else:
                f.write(line)
        if not key_exists:
            f.write(f'{key}="{value}"\n')  # append if missing

# Example usage when handling a POST request:
mnemonic_from_frontend = "word1 word2 word3 ... word25"
save_env_var("USER_MNEMONIC", mnemonic_from_frontend)
