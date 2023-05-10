# TypeScript’s Type System

::: tip 提示
TypeScript 的类型系统非常强大，能够表达出你可能想象不到的类型。
:::

## 2.1、使用你的编辑器来探索类型系统

你可以将鼠标放到元素上，TypeScript 会自动推断它的类型（参见下图），虽然你没有为这个变量定义为：数字类型，但是 `TypeScript` 能够根据值推断出来。

<div style="display: flex; justify-content: center;">
    <img src="../.vuepress/public/img/typeShow.jpg" />
</div>

_查看`TypeScript`在任何给定点上对变量类型的理解对于建立一个围绕扩展和缩小的直觉是至关重要的。查看条件分支中变量变化的类型是对类型系统建立信心的一种重要方法（参见图 2)。_

<div style="display: flex; justify-content: center;">
    <img src="../.vuepress/public/img/2-3.jpg" />
</div>

## 2.2、将类型看作值的集合

在运行时，每个变量都有一个从 JavaScript 值的范围中选择的值。可能的值有很多，包括:

- 42
- null
- undefined
- 'Canada'
- {animal: 'Whale', weight_lbs: 40_000}
- /regex/
- new HTMLButtonElement
- (x, y) => x + y

但是在你的代码运行之前，当 TypeScript 检查它的错误时，它只有一个类型。最好把它理解为一组可能的值。这个集合就是定义域的类型。例如，你可以认为 number 类型是所有数值的集合。42 和-37.25 在其中，但“Canada”没有。根据严格的检查，Null 和 undefined 可能是集合的一部分，也可能不是。

最小的集合是空集，它不包含任何值。它对应于 TypeScript 中的`never`类型。因为它的域是空的，所以没有值可以赋值给`never`类型的变量:

```ts
const x: never = 12;
// ~ Type '12' is not assignable to type 'never'
```

下一个最小的集合是那些包含单个值的集合。这些对应于 TypeScript 中的字面量类型，也称为单元类型：

```ts
type A = "A";
type B = "B";
type Twelve = 12;
```

要想形成两个或三个值的类型，你可以进行合并单元类型：

```ts
type AB = "A" | "B";
type AB12 = "A" | "B" | 12;
```

_`assignable` 一词出现在许多 TypeScript 错误中。在值集合的上下文中，它要么是“成员”(指值和类型之间的关系)，要么是“子集”(指两种类型之间的关系)_

```ts
const a: AB = "A"; // OK, value 'A' is a member of the set {'A', 'B'}
const c: AB = "C";
// ~ Type '"C"' is not assignable to type 'AB'
```

类型“C”是单位类型。它的定义域由单个值“C”组成。这不是 AB(由值“A”和“B”组成)的定义域的子集，所以这是一个错误。说到底，几乎所有的类型检查都是在测试一个集合是否是另一个集合的子集：

```ts
const ab: AB = Math.random() < 0.5 ? "A" : "B"; // OK, {"A", "B"} is a subset of {"A", "B"}:
const ab12: AB12 = ab; // OK, {"A", "B"} is a subset of {"A", "B", 12}

declare let twelve: AB12;
const back: AB = twelve; // ~~~~  Type 'AB12' is not assignable to type 'AB'; Type '12' is not assignable to type 'AB'
```

这些类型的集合很容易推理，因为它们是有限的。但在实践中使用的大多数类型都有无限值域。对此的推理可能会更加困难。你可以认为它们是建设性地构建的：

```ts
interface Person {
  name: string;
}
interface Lifespan {
  birth: Date;
  death?: Date;
}
type PersonSpan = Person & Lifespan;
```

&运算符计算两种类型的交集。哪些类型的值属于 `PersonSpan` 类型？乍一看，`Person` 和 `Lifespan` 接口没有共同的属性，所以你可能会认为它是空集合(即 never 类型)。但类型操作适用于值的集合(类型的域)，而不是
接口中的属性。记住，具有附加属性的值仍然属于类型。因此同时具有 `Person` 和 `Lifespan` 属性的值属于交集:

```js
const ps: PersonSpan = {
  name: "Alan Turing",
  birth: new Date("1912/06/23"),
  death: new Date("1954/06/07"),
}; // OK
```

::: warning
当然，一个值可以具有以上三个属性，但仍然属于该类型！一般规则是：交集类型的值包含其每个组成部分属性的并集。
:::

另一种更常用的编写`PersonSpan`类型的方法是使用 `extends`：

```ts
interface Person {
  name: string;
}
interface PersonSpan extends Person {
  birth: Date;
  death?: Date;
}
```

把类型看作值的集合，那么 `extends` 是什么意思呢？就像“assignable to”一样，你可以把它读作“subset of”。`PersonSpan`中的每个值都必须有一个 name 属性，它是一个字符串。每个值都必须有一个 birth 属性，
所以它是一个子集。

你可能会听到“子类型”这个词，也就是说一个集合的定义域是其他集合的子集。以一维、二维和三维向量的方式思考：

```ts
interface Vector1D {
  x: number;
}
interface Vector2D extends Vector1D {
  y: number;
}
interface Vector3D extends Vector2D {
  z: number;
}
```

你会说 Vector3D 是 Vector2D 的子类型，而 Vector2D 是 Vector1D 的子类型(在类的上下文中，你会说“子类”)。这种关系通常绘制成一个层次结构，但从值集的角度考虑，维恩图更合适(见图 2-7)。

<div style="display: flex; justify-content: center;">
    <img src="../.vuepress/public/img/2-7.png" />
</div>

当类型之间的关系不是严格的层次关系时，集合解释也更有意义。例如，string|number 和 string|Date 之间是什么关系？它们的交集是非空的(字符串)，但都不是另一个的子集。尽管如此，它们的域之间的关系是明确的，
尽管这些类型不符合严格的层次结构(见图 2-8)。

<div style="display: flex; justify-content: center;">
    <img src="../.vuepress/public/img/2-8.jpg" />
</div>

将类型视为集合还可以阐明数组和元组之间的关系。例如:

```js
const list = [1, 2]; // Type is number[]
const tuple: [number, number] = list;
// ~~~~~ Type 'number[]' is missing the following
// properties from type '[number, number]': 0, 1
```

是否存在非数字对的数字列表？当然！空列表和`list [1]`是例子。因此 number[]不能赋值给[number, number]，这是有道理的，因为它不是[number, number]的子集。(反向赋值是可行的。)

::: warning
最后，值得注意的是，并不是所有的值集都对应于`TypeScript`类型。对于所有的整数，或者只有 x 和 y 属性但没有其他属性的对象，都没有 `TypeScript` 类型。有时你可以使用 `Exclude` 来减去类型，但前提是它会得到
正确的 TypeScript 类型。
:::

```ts
type T = Exclude<string | Date, string | number>; // Type is Date
type NonZeroNums = Exclude<number, 0>; // Type is still just number
```

## 2.3、类型空间或值空间

在 TypeScript 里存在两种声明空间：类型声明空间与变量声明空间。

- Type space
- Value space

```ts
interface Cylinder {
  radius: number;
  height: number;
}
const Cylinder = (radius: number, height: number) => ({ radius, height });
```

`接口 Cylinder` 在类型空间中引入符号。`const Cylinder` 在值空间中引入符号。他们彼此之间没有任何关系。根据上下文，当你键入 `Cylinder` 时，你可能是引用类型或是引用值，这就容易导致错误。

```ts
function calculateVolume(shape: unknown) {
  if (shape instanceof Cylinder) {
    shape.radius;
    // ~~~~~~ Property 'radius' does not exist on type '{}'
  }
}
```

你在使用实例来检查形状是否为圆柱体类型。但是 `instanceof` 是 `JavaScript` 的运行时操作符，它对值进行操作。所以 `instanceof` 圆柱体指的是函数，而不是类型。

一个符号是在类型空间还是值空间中，乍一看并不总是很明显。你必须从这个符号出现的语境中判断。这可能会特别令人困惑，因为许多类型空间结构看起来与值空间结构完全相同。比如：

```ts
type T1 = "string literal";
type T2 = 123;
const v1 = "string literal";
const v2 = 123;
```

::: warning
`TypeScript`中的语句可以在类型空间和值空间之间交替使用。通常，类型或接口后面的符号位于类型空间中，而在`const`或`let`=之后声明中引入的符号则是值空间。
:::

```ts
interface Person {
  first: string;
  last: string;
}
const p: Person = { first: "Jane", last: "Jacobs" };
// - --------------------------------- Values
// ------ Type
```

有许多操作符和关键字在一个类型或值上下文中表示不同的东西，例如：

```ts
type T1 = typeof p; // Type is Person
type T2 = typeof email;
// Type is (p: Person, subject: string, body: string) => Response
const v1 = typeof p; // Value is "object"
const v2 = typeof email; // Value is "function"
```

在类型上下文中，`typeof` 接受一个值并返回其 `TypeScript` 类型。你可以在更大的类型表达式中使用它们，也可以使用类型语句为它们命名。

在值的上下文中，`typeof`是`JavaScript`运行时的 typeof 操作符。它返回一个字符串，其中包含符号的运行时类型。这和`TypeScript`类型不一样！`JavaScript`的动态类型系统比`TypeScript`的静态类型系统简单得多。
与`TypeScript`无限多样的类型相比，历史上`JavaScript`只有六种动态类型:“string”、“number”、“boolean”、“undefined”、“object”和“function”。

在这两个空间中，还有许多其他的结构有不同的含义：

- this 在值空间是 JavaScript 的 this 关键字(Item 49)。作为一种类型，这是 this 的 TypeScript 类型，又名“多态 this”。它有助于实现带有子类的方法链。
- 在值空间中 & 和 | 是代表 and 和 or。在类型空间中，它们是交集操作符和并集操作符。
- const 值空间代表引入了一个新变量。as const 在类型空间中，改变了字面量或字面量表达式的推断类型。
- extends 可以定义子类(类 a 扩展 B)或子类型(接口 a 扩展 B)或泛型类型的约束(generic <T extends number>)。
- in 可以是循环(for (key in object))的一部分，也可以是映射类型。

## 2.4、首选类型声明，而不是类型断言
