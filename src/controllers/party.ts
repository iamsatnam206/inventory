import { Route, Tags, Post, Path, Controller, Body} from "tsoa";

interface PartyResponse {
    data: any,
    status: number,
    error: string,
    message: string;
}
interface party {
    username: string,
    phoneNumber: number
}

@Tags('Party')
@Route("party")
export default class PartyController extends Controller {

    @Post("/save")
    public async save(@Body() request: party ): Promise<PartyResponse> {
        return {
            data: '',
            error: '',
            message: '',
            status: 200
        }
    }

    @Post("/login")
    public async login(): Promise<PartyResponse> {
        return {
            data: '',
            error: '',
            message: '',
            status: 200
        }
    }

}