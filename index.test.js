const {Observable} = require(".");

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