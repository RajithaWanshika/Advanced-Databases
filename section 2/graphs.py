import math
import matplotlib.pyplot as plt

B = 3
fan_in = B - 1

N_values = [3, 6, 12, 24, 48, 96, 192, 384]

passes = []
for N in N_values:
    runs = math.ceil(N / B)
    P = 1 + math.ceil(math.log(runs, fan_in))
    passes.append(P)

for i in range(len(N_values)):
    print(f"N = {N_values[i]}, Passes = {passes[i]}")

plt.figure()
plt.plot(N_values, passes, marker='o')
plt.xlabel("Number of Pages (N)")
plt.ylabel("Number of Passes (P)")
plt.title("External Sorting Passes vs File Size (B = 3)")
plt.grid()
plt.show()