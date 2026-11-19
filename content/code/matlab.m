actual = [ones(1,45), zeros(1,55)];
predicted = [ones(1,36), zeros(1,9), ...
             ones(1,11), zeros(1,44)];
[C, order] = confusionmat(actual, predicted);
disp(order)
disp(C)

% For binary labels ordered [0,1], C is expected as:
% [44 11; 9 36]
