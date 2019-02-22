const {Observable,LinkedState} = require(".");

describe("testing index3", () => {
    it("testing observable and subscribe", () => {
        const text = 'it worked';
        let result;
        const obs = new Observable(observer => {
            observer.next(text)
        })

        obs.subscribe({
            next(data){
                result= data;
            }
        })
        expect(result).toEqual(text)
    })
    it("testing observable and map", () => {
        let result;
        const obs = new Observable(observer => {
            observer.next(5)
        })
        obs
        .map(x => x + 2)
        .subscribe(x => result = x)

        expect(result).toEqual(7)
    })
    it('testing observable and filter', () => {
        let result;
        const obs = new Observable(observer => {
            observer.next(5)
        })
        obs
        .filter(x => x > 2)
        .subscribe(x => result = x)

        expect(result).toEqual(5)
    })
    it('testing observable and filterMap', () => {
        let result;
        const obs = new Observable(observer => {
            observer.next(5)
        })
        obs
        .filterMap(x => x > 2, x => x + 5)
        .subscribe(x => result = x)

        expect(result).toEqual(10)
    })

    it('test observable and from', () => {
        const sw = [1,2,3,4,5]
        let result = [];
        const from = Observable.from(sw)

        from
        .map(x => x + 1)
        .subscribe(x => {
            result.push(x)
        })
        expect(result).toEqual([2,3,4,5,6])
    })

    it("test obesrvable and of", () => {

        const of = Observable.of(1,2,3,4,5,"aa")
        const result = []
        of
        .map(x => {
            if(typeof x === 'number'){
                return x + 1
            }
            return x
        })
        .subscribe(x => {
            result.push(x)
        })
        expect(result).toEqual([2,3,4,5,6,"aa"])
    })
})

let firstState
let secondState
let thirdState

beforeAll(() => {
     firstState = {
        data:{
            data:"first"
        }
    }
     secondState = {
        data:{
            data:"second"
        }
    }
    thirdState = {
        data:{
            data:"third"
        }
    }
})

describe("testing LinkedState", () => {
    it("add a first state", () => {
        const store = new LinkedState()
        store.insert(firstState)
        expect(store.getState()).toEqual(firstState)
    })
    it('add a second state', () => {
        const store = new LinkedState()
        store.insert(firstState)
        store.insert(secondState)
        expect(store.getState()).toEqual(secondState)
        expect(store.getPrevState()).toEqual(firstState)
        expect(store.getInitialState()).toEqual(firstState)
        expect(store.getLength()).toEqual(2)
    })
    it("add three state", () => {
        const store = new LinkedState()
        store.insert(firstState)
        store.insert(secondState)
        store.insert(thirdState)
        expect(store.getInitialState()).toEqual(firstState)
        expect(store.getLength()).toEqual(3)
        expect(store.getPrevState()).toEqual(secondState)
        expect(store.getState()).toEqual(thirdState)
    })
    it('pop the current state', () => {
        const store = new LinkedState()
        store.insert(firstState)
        store.insert(secondState)
        store.insert(thirdState)
        const popedState = store.pop();
        expect(popedState).toEqual(thirdState)
        expect(store.getLength()).toEqual(2)
        expect(store.getState()).toEqual(secondState)
        expect(store.getPrevState()).toEqual(firstState)
        expect(store.getInitialState()).toEqual(firstState)
    })
    it("shift the initial state", () => {
        const store = new LinkedState()
        store.insert(firstState)
        store.insert(secondState)
        store.insert(thirdState)
        const shiftedState = store.shift()
        expect(shiftedState).toEqual(firstState)
        expect(store.getLength()).toEqual(2)
        expect(store.getInitialState()).toEqual(secondState)
        expect(store.getState()).toEqual(thirdState)
        expect(store.getPrevState()).toEqual(secondState)
    })

    it("find", () => {
        const store = new LinkedState()
        store.insert(firstState)
        store.insert(secondState)
        store.insert(thirdState)
        const stateArray = store.find(["data",'data'])
        expect(stateArray).toEqual(['first','second','third'])
    })

    it("update", () => {
        const newText = "updated value"
        const store = new LinkedState()
        store.insert(firstState)
        store.insert(secondState)
        store.insert(thirdState)
        const updatedState = store.update(['data','data'], newText)
        expect(store.getState()).toEqual(updatedState)
    })

    it("replace", () => {
        const newState = {
            data:{
                data:"third"
            },
            newData:[1,2,3,3,4]
        }
        const store = new LinkedState()
        store.insert(firstState)
        store.insert(secondState)
        store.insert(thirdState) 
        store.replace(newState)
        expect(store.getState()).toEqual(newState)
    })
    it("rollback", () => {
        const store = new LinkedState()
        store.insert(firstState)
        store.insert(secondState)
        store.insert(thirdState) 
        const oldState = store.rollback();
        expect(oldState).toEqual(thirdState)
        expect(store.getState()).toEqual(secondState)
    })
    it("reset", () => {
        const store = new LinkedState()
        store.insert(firstState)
        store.insert(secondState)
        store.insert(thirdState) 
        store.reset()
        expect(store.getState()).toEqual(firstState)
    })
    it("set limit", () => {
        const store = new LinkedState()
        store.setLimit(3);
        store.insert(firstState)
        store.insert(secondState)
        store.insert(thirdState) 
        store.insert({
            data:"ss"
        }) 

        expect(store.getState()).toEqual(thirdState)
        expect(store.getLength()).toEqual(3)
    })
})