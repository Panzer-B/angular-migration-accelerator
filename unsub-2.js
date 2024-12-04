module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Ensure RxJS subscriptions properly handle unsubscription",
      category: "Best Practices",
      recommended: true,
    },
    schema: [], // No options
  },
  create(context) {
    // Utility to check if an observable has a specific operator in its pipe chain
    const isPipeWithOperator = (node, operator) => {
      return (
        node &&
        node.type === "CallExpression" &&
        node.callee.property &&
        node.callee.property.name === "pipe" &&
        node.arguments.some(
          (arg) =>
            arg.type === "CallExpression" && arg.callee.name === operator
        )
      );
    };

    // Utility to check if an observable is directly used with combineLatest
    const isCombineLatestCall = (node) => {
      return (
        node &&
        node.type === "CallExpression" &&
        node.callee.name === "combineLatest"
      );
    };

    return {
      CallExpression(node) {
        // Step 1: Catch `.subscribe()` calls
        if (node.callee.property && node.callee.property.name === "subscribe") {
          const parent = node.parent;

          // Step 2: Ensure the subscription is assigned to a variable
          const isAssigned =
            parent.type === "VariableDeclarator" || parent.type === "MemberExpression";

          if (!isAssigned) {
            context.report({
              node,
              message: "Subscriptions must be assigned to a variable or handled properly.",
            });
          }

          // Step 3: Ensure unsubscription is handled using takeUntil or similar
          const observable = node.callee.object;
          const hasUnsubscribeOperator =
            isPipeWithOperator(observable, "takeUntil") ||
            isPipeWithOperator(observable, "first") ||
            isPipeWithOperator(observable, "take");

          if (!hasUnsubscribeOperator) {
            context.report({
              node,
              message: "Observable must use 'takeUntil', 'first', or 'take' to ensure proper unsubscription.",
            });
          }
        }

        // Step 4: Handle `combineLatest` scenarios
        if (isCombineLatestCall(node)) {
          const observables = node.arguments[0].elements || []; // Assume combineLatest([obs1, obs2])
          observables.forEach((observable) => {
            const isPiped = isPipeWithOperator(observable, "takeUntil");

            if (!isPiped) {
              context.report({
                node: observable,
                message:
                  "Each observable used in 'combineLatest' must be piped with 'takeUntil' or similar operator.",
              });
            }
          });
        }
      },
    };
  },
};
