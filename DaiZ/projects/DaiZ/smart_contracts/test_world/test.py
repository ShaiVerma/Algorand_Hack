from algokit_utils import ApplicationClient, AlgorandClient, applications

# Connect to LocalNet
algorand = AlgorandClient.from_environment()

# Create a random test user
user = algorand.account.random()
print("New test user:", user.address)

# Existing deployed app
APP_ID = 1009

# Connect to the app
app_client = applications.AppClient.from_network(
    algorand=algorand,
    app_spec=APP_ID,
    default_signer=user.signer
)

# Call the ABI method (replace "hello" with your method name)
result = app_client.call_method("hello", name="Alice")

print("Tx ID:", result.tx_id)
print("Return value:", result.abi_return)
print("Logs:", result.tx_info.get("logs"))
