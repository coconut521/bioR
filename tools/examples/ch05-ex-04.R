n <- 5
res <- numeric(0)
for (i in 1:n) res <- c(res, sqrt(i))  # 每轮都新建一个更长的向量
res
identical(res, sqrt(1:n))

fast <- numeric(n)
for (i in 1:n) fast[i] <- sqrt(i)      # 先分配、再填空位
identical(res, fast)

T <- 0                                  # T 不是保留字，会被覆盖
if (T) "run" else "skip"
rm(T)
TRUE == 1
