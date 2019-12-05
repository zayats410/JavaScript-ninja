function singleRotate(node,direction){
    var temp = node;
    var otherDirection = direction === 'left' ? 'right' : 'left';
    var tree = temp[otherDirection];
    temp[otherDirection] = tree[direction];
    tree[direction] = temp;
    return tree;
}

function doubleRotate(node, direction){
    var otherDirection = direction === 'left' ? 'right' : 'left';
    var tree = node[otherDirection];
    node[otherDirection] =  singleRotate(tree, otherDirection);
    return singleRotate(node,direction);
}

function checkTree(tree){
    var result = false;
    var CV = checkValues(tree);
    var CC = checkColours(tree);
    var CBH = checkBlackHeight(tree);
    if(CV && CC && CBH){
        result = true;
    }
    return result;
}

function checkValues(tree){
    function checkWithGrandParent(tree, grandParent) {
        var leftResult = false;
        var rightResult = false;
        if (!tree.left && !tree.right) {
            return true;
        }
        if (tree.left) {
            if (tree.left.value < tree.value && checkGrandParentValue(grandParent, tree, tree.left)) {
                leftResult = checkWithGrandParent(tree.left, tree);
            } else {
                return false;
            }
        }
        if (tree.right) {
            if (tree.right.value > tree.value && checkGrandParentValue(grandParent, tree, tree.right)) {
                rightResult = checkWithGrandParent(tree.right, tree);
            } else {
                return false;
            }
        }
        return leftResult && rightResult;
    }
    return checkWithGrandParent(tree, null);
}

function checkGrandParentValue(grandParent, parent, child){
    if(!grandParent){
        return true;
    }
    if(parent.value < grandParent.value && child.value < grandParent.value){
        return true;
    }
    if(parent.value > grandParent.value && child.value > grandParent.value){
        return true;
    }
    return false;
}

function checkColours(tree){
    var result = false;
    if(tree.left == null && tree.right == null){
        result = true;
    }
    if(tree.color === 'black'){
        if(tree.left){
            result = checkColours(tree.left);
        }
        if(tree.right){
            result = checkColours(tree.right);
        }
    }
    if(tree.color === 'red'){
        if(tree.left){
            if(tree.left.color === 'black'){
                result = checkColours(tree.left);
            } else if(tree.left.color === 'red'){
                result = false;
            }
        }
        if(tree.right){
            if(tree.right.color === 'black'){
                result = checkColours(tree.right);
            } else if(tree.right.color === 'red'){
                result = false;
            }
        }
    }
    return result;
}


function checkBlackHeight(tree){
    result = false;
    if(getBlackHeight(tree) !== -1){
        result = true;
    }
    return result;
}

function getBlackHeight(tree){
    var result;
    if(tree.color === 'black'){
        result = checkHeightForBlack(tree);
    }
    if(tree.color === 'red'){
        result = checkHeightForRed(tree);
    }
    return result;
}

function checkHeightForBlack(tree){
    var result = -1;
    var leftRes = 0;
    var rightRes = 0;
    if(tree.left == null && tree.right == null){
        result = 1;
    }
    if(tree.left){
        leftRes = getBlackHeight(tree.left);
    }
    if(tree.right){
        rightRes = getBlackHeight(tree.right);
    }
    if(leftRes === rightRes) {
        result = rightRes + 1;
    }
    return result;
}

function checkHeightForRed(tree){
    var result = -1;
    var leftRes = 0;
    var rightRes = 0;
    if(tree.left == null && tree.right == null) {
        result = 0;
    }
    if(tree.left){
        leftRes = getBlackHeight(tree.left);
    }
    if(tree.right){
        rightRes = getBlackHeight(tree.right);
    }
    if(leftRes === rightRes){
        result = rightRes;
    }
    return result;
}


function addNode(mainTree,v) {
    var root = mainTree;
    var node = {value: v, color: 'red'};

    function addValue(tree) {
        if (v < tree.value) {
            if (tree.left == null) {
                tree.left = node;
            } else {
                addValue(tree.left);
            }
        } else if (v > tree.value) {
            if (tree.right == null) {
                tree.right = node;
            } else {
                addValue(tree.right);
            }
        }
    }

    function getParent(tree, node) {
        var leftParent;
        var rightParent;
        if ((tree.left && tree.left === node) || (tree.right && tree.right === node)) {
            return tree;
        }
        if (tree.left && tree.right) {
            leftParent = getParent(tree.left, node);
            rightParent = getParent(tree.right, node);
            if (leftParent) {
                return leftParent;
            }
            if (rightParent) {
                return rightParent;
            }
            return null;
        }
        if (tree.left) {
            return getParent(tree.left, node);
        }
        if (tree.right) {
            return getParent(tree.right, node);
        }
        return null;
    }

    function getUncle(tree, node) {
        var parent = getParent(tree, node);
        var grandparent = getParent(tree, parent);
        if (grandparent === null) {
            return null;
        }
        if (grandparent.left && grandparent.left === parent) {
            return grandparent.right ? grandparent.right : null;
        }
        if (grandparent.right && grandparent.right === parent) {
            return grandparent.left ? grandparent.left : null;
        }
        return null;
    }

    function insertedCase1(addedNode1) {
        if (root === addedNode1) {
            addedNode1.color = 'black';
            return root;
        } else {
            return insertedCase2(addedNode1);
        }
    }

    function insertedCase2(addedNode2)  {
        var parent = getParent(root, addedNode2);
        if (parent && parent.color === 'black') {
            return root;
        } else {
            return insertedCase3(addedNode2);
        }
    }

    function insertedCase3(addedNode3) {
        var parent = getParent(root, addedNode3);
        var uncle = getUncle(root, addedNode3);
        var grandparent = getParent(root, parent);
        if (uncle && uncle.color === 'red' && parent && parent.color === 'red') {
            parent.color = 'black';
            uncle.color = 'black';
            grandparent.color = 'red';
            return insertedCase1(grandparent);
        } else {
            return insertedCase4(addedNode3);
        }
    }

    function insertedCase4(addedNode4) {
        var parent = getParent(root, addedNode4);
        var uncle = getUncle(root, addedNode4);
        var grandparent = getParent(root, parent);
        var grandGrandParent = getParent(root, grandparent);
        if (grandparent) {
            if (((uncle && uncle.color === 'black') || !uncle) && parent && parent.color === 'red' && addedNode4 === parent.right && parent === grandparent.left) {
                var rotatedDR = doubleRotate(grandparent, 'right');
                grandparent.color = 'red';
                addedNode4.color = 'black';
                if (grandparent === root) {
                    root = rotatedDR;
                } else {
                    if (grandGrandParent.left === grandparent) {
                        grandGrandParent.left = rotatedDR;
                    } else {
                        grandGrandParent.right = rotatedDR;
                    }
                }
                return root;
            } else if (((uncle && uncle.color === 'black') || !uncle) && parent && parent.color === 'red' && addedNode4 === parent.left && parent === grandparent.right) {
                var rotatedDL = doubleRotate(grandparent, 'left');
                grandparent.color = 'red';
                addedNode4.color = 'black';
                if (grandparent === root) {
                    root = rotatedDL;
                } else {
                    if (grandGrandParent.left === grandparent) {
                        grandGrandParent.left = rotatedDL;
                    } else {
                        grandGrandParent.right = rotatedDL;
                    }
                }
                return root;
            }
        }
        return insertedCase5(addedNode4);
    }

    function insertedCase5(addedNode5) {
        var parent = getParent(root, addedNode5);
        var uncle = getUncle(root, addedNode5);
        var grandparent = getParent(root, parent);
        var grandGrandParent = getParent(root, grandparent);
        if(grandparent) {
            if (((uncle && uncle.color === 'black') || !uncle) && parent && parent.color === 'red' && addedNode5 === parent.left && parent === grandparent.left) {
                var rotatedSR = singleRotate(grandparent, 'right');
                parent.color = 'black';
                grandparent.color = 'red';
                if (grandparent === root) {
                    root = rotatedSR;
                } else {
                    if(grandGrandParent.left === grandparent){
                        grandGrandParent.left = rotatedSR;
                    } else {
                        grandGrandParent.right = rotatedSR;
                    }
                }
                return root;
            } else if (((uncle && uncle.color === 'black') || !uncle) && parent && parent.color === 'red' && addedNode5 === parent.right && parent === grandparent.right) {
                var rotatedSL = singleRotate(grandparent, 'left');
                parent.color = 'black';
                grandparent.color = 'red';
                if (grandparent === root) {
                    root = rotatedSL;
                } else {
                    if(grandGrandParent.left === grandparent) {
                        grandGrandParent.left = rotatedSL;
                    } else {
                        grandGrandParent.right = rotatedSL;
                    }
                }
                return root;
            }
        }
    }

    if (root === null) {
        root = node;
        return insertedCase1(root);
    } else {
        addValue(root);
        return insertedCase1(node);
    }
}
