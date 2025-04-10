// 基本类型
// let num1: number = 123
let str: string = '123'
let bool: boolean = false
let nul: null = null
// let big: bigint = 10n
let udf: undefined = undefined
let syml: symbol = Symbol()
// 引用类型
// 数组
let arr: Array<number | string> = [1, 2, 3]
let arr2: Array<number | string | boolean> = [1, '23', false]
// 元组 (类似于一对一)
//  type C = [number, string] // 元祖
let t: [number, string] = [1, '2'] // ok
// let t2: (number | string)[] = ['23', 4]
// let liu:string[]=[]
//   let t1: [number, string] = [1, 3] // error
//   let t2: [number, string] = [1] // error
//   let t3: [number, string] = [1, '1', true] // error
// 对象
// let obj: { a: string, b: number } = { a: 'bing', b: 123 }
let obj: { a: Array<number | string | Object>, b: number } = { a: [134, '234', { c: '234' }], b: 123 }
// obj.a = '666'
// 函数
const getStr = (str: string) => {
    console.log(str);
}
getStr('qws')
// 函数2
const getStr1 = (str: string, str2?: number): void => {
    console.log('void 常用于没有返回值')
}
getStr1('qws')
// never 类型表示永远不会有值的一种类型
// 类型断言
let res: number = (str as string).length;
let num: number;
let num1!: number;

const setNumber = () => num = 7
const setNumber1 = () => num1 = 7

setNumber()
setNumber1()

console.log(num) // error 
console.log(num1) // ok
// 类型
type InfoProps = string | number

const setInfo = (data: InfoProps) => { }

// 接口
interface Props {
    a: string;
    b: number;
    c: boolean;
    d?: number; // 可选属性
    readonly e: string; //只读属性
    [f: string]: any //任意属性
}
// let res1: Props = {
//     a: '小杜杜',
//     b: 7,
//     c: true,
//     e: 'Domesy',
//     d: 1, // 有没有d都可以
//     hh: 2 // 任意属性，之前为定义过h
// }

interface Props1 {
    (data: string): string
    // 输入：输出
}

const info1: Props1 = (number: string) => number  //可定义函数
info1('123')

interface SearchFunc {
    (source: string, subString: string): boolean;
}
let mySearch: SearchFunc = function (source: string, subString: string) {
    return source.search(subString) !== -1;
}

// 泛型
// const calcArray = (data:any):any[] => {
//     let list = []
//     for(let i = 0; i < 3; i++){
//         list.push(data)
//     }
//     return list
// }

// console.log(calcArray('d')) // ["d", "d", "d"]

const calcArray = <T>(data:T):T[] => {
    let list: T[] = []
    for(let i = 0; i < 3; i++){
        list.push(data)
    }
    return list
}

// const res1:string[] = calcArray<string>('d') // ok
// const res11:number[] = calcArray<number>(7) // ok

// type Props = {
//     name: string,
//     age: number
// }
// const res3: Props[] = calcArray<Props>({name: '小杜杜', age: 7}) //ok

// const calcArray = <T,U>(name:T, age:U): {name:T, age:U} => {
//     const res: {name:T, age:U} = {name, age}
//     return res
// }

// const res22 = calcArray<string, number>('小杜杜', 7)
// console.log(res) // {"name": "小杜杜", "age": 7}

// 泛型接口

//  <类型>(参数)<>:输出类型

//    const calcArray = <T,>(data:T): number => {
//       return data.length // error 
//     }
interface A<T> {
    data: T
}

const getInfo: A<string> = { data: '234' }

interface Props {
    name: string;
    age: number;
    sex: boolean
}

type PropsKey = keyof Props; //包含 name， age， sex

const res3: PropsKey = 'name' // ok
const res13: PropsKey = 'tel' // error

// interface User {
//     name: string;
//     age: number;
//    }
// type UserKeys = keyof User; 

// 类型
// type person ={
//     name:string,
//     age: number,
//     from:string
// }
// let lxp: person = {
//     name:'lxp',
//     age: 80,
//     from:'zk'
// }

// 使用 Record 工具类型来定义 ！！！！！！！！！！！！
type HOUDUNREN = Record<string, string | number | boolean>

let hd: HOUDUNREN = {
    name: 'houdunren',
    1: '134',
    2: 678,
}

// Record 可以使用联合类型定义索引
type HOUDUNREN2 = Record<'name' | 'age' | 'city', string>

let hd2: HOUDUNREN2 = {
    name: 'houdunren',
    age: '18',
    city: 'beijing',
}

// 1，交叉类型 &   2，联合类型 ｜
let a1 = { name: '后盾人' }
let b1 = { age: 10, name: true }

type HD1 = typeof a1 & typeof b1

//报错 不能将类型“string”分配给类型“never”。
// let c: HD1 = { age: 30, name: 'houdunren' }

type OBG = Record<'name' | 'age' | 'city', string>

// 函数返回值类型限制
let sum = (a: number, b: number): string => `计算结果是：${a + b}`

let arr111: (string | number | boolean)[] = ['234', 233]


// 断言类型 as
// function hd() {
//     let a = 'houdunren.com'
//     let b = (x: number, y: number): number => x + y
//     return [a, b]
//   }

//   let [n, m] = hd() as [string, (x: number, y: number) => number]
//   console.log(m(9, 19))

// function hdhd() {
//     let a = '后盾人'
//     let b = (): void => { }
//     return [a, b] as const
// }

// const [x, y] = hdhd() //变量 y 的类型为 () => void

// 约束函数定义

// interface Pay {
//     (price: number): boolean
// }
// const getUserInfo: Pay = (price: number) => true

interface UserInterface {
    name: string;
    age: number;
    isLock: boolean;
}
const hd6: UserInterface = {
    name: '后盾人',
    age: 18,
    isLock: false
}

const xj: UserInterface = {
    name: '向军',
    age: 16,
    isLock: false
}

const users: UserInterface[] = [];
users.push(hd6, xj)
console.log(users);

// 使用类(class) 时建议使用接口，这可以与其他编程语言保持统一

// 决定使用哪个方式声明类型，最终还是看公司团队的规范

// 泛型 
// 函数名 类型 参数: 返回值类型
// dump  <T> (arg:T) :T

const fanx = <T>(str: T): T => {
    return str
}
fanx<string>('dewf')

// 泛型继承
function getLength<T extends string | any[]>(arg: T): number {
    return arg.length
}

console.log(getLength('houdunren.com'))
console.log(getLength(['后盾人', '向军']))

function getLength1<T>(arg: T[]): number {
    return arg.length;
}

// 类
// class Collection<T> {
//     data: T[] = []
//     public push(...items: T[]) {
//         this.data.push(...items)
//     }
//     public shift() {
//         return this.data.shift()
//     }
// }

// const collections = new Collection<number>()
// collections.push(1)

// type User = { name: string, age: number }
// const hd22: User = { name: "后盾人", age: 18 }
// const userCollection = new Collection<User>()

// userCollection.push(hd22)
// console.log(userCollection.shift());

class User<T>{
    constructor(protected _user: T) { }
    public get(): T {
        return this._user
    }
}

interface UserInterface1 {
    name: string,
    age: number
}
const instance = new User<UserInterface1>({ name: '后盾人', age: 18 })
console.log(instance.get().age);

//泛型/ 接口
//文章接口
interface articleInterface<T, B> {
    title: string,
    isLock: B,
    comments: T[],
}

//评论类型
type CommentType = {
    comment: string
}

//定义文章数据包含评论内容
const hd55: articleInterface<CommentType, boolean> = {
    title: '后盾人官网',
    isLock: true,
    comments: [
        { comment: '这是一个评论' }
    ]
}

console.log(hd55);

// 
interface NumberArray{
    [index:number]:string
}
const myArray1: NumberArray = {
    123:'123'
}

// 类型推断
/**
 * Obtain the return type of a function type
 */
// 推断函数返回值类型
type RType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;

const add = (x: number, y: number) => x + y

type Type1 = typeof add // (x: number, y: number) => number
type T1 = RType<Type1> // number

// 推断函数参数类型
type ParamsType<T extends (...args: any) => any> = T extends (...args: infer R) => any ? R : any;

const add = (a: number, b: string) => a + b


type TypeAdd = typeof add // (a: number, b: string) => string

type T1 = ParamsType<TypeAdd> // [number, string]

const arr: T1 = [1, 2] // Error: Type 'number' is not assignable to type 'string'.
