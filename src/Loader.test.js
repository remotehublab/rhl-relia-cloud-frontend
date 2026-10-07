import React,{useState} from 'react';
import {render,screen,fireEvent,act} from '@testing-library/react';
import Loader from './Loader';
jest.mock('./i18n',()=>({t:value=>value}));
jest.mock('react-i18next',()=>({withTranslation:()=>Component=>Component}));
const noFiles=[];
function Fixture(){
 const [storedFiles,setStoredFiles]=useState(['old.grc']);const [fileStatus,setFileStatus]=useState(null);
 return <Loader storedFiles={storedFiles} setStoredFiles={setStoredFiles} fileStatus={fileStatus} setFileStatus={setFileStatus} selectedFilesColumnRX={noFiles} selectedFilesColumnTX={noFiles} currentSession={{}} setCurrentSession={()=>{}} setSelectedTab={()=>{}} setSelectedFilesColumnRX={()=>{}} setSelectedFilesColumnTX={()=>{}} manageTask={()=>{}} checkStatus={()=>{}}/>;
}
function upload(){fireEvent.change(screen.getByLabelText('Upload GNU Radio flowgraphs'),{target:{files:[new File(['source'],'new file.grc',{type:'application/octet-stream'})]}});}
afterEach(()=>{jest.restoreAllMocks();delete global.fetch;});
test('upload uses authoritative sanitized filenames without optimistic duplicates',async()=>{
 global.fetch=jest.fn(url=>Promise.resolve({ok:true,json:()=>Promise.resolve(url.endsWith('/metadata/')?{success:true}:{success:true,files:['new_file.grc']})}));
 render(<Fixture/>);await act(async()=>upload());expect(screen.getByText('new_file.grc')).toBeInTheDocument();expect(screen.queryByText('new file.grc')).toBeNull();expect(screen.queryByText('old.grc')).toBeNull();
});
test('failed upload keeps a visible error and does not invent uploaded files',async()=>{
 jest.spyOn(console,'error').mockImplementation(()=>{});
 global.fetch=jest.fn(url=>Promise.resolve({ok:url.endsWith('/metadata/'),json:()=>Promise.resolve({success:true})}));
 render(<Fixture/>);await act(async()=>upload());expect(screen.getByText('loader.upload.file-status.upload-error')).toBeInTheDocument();expect(screen.queryByText('new file.grc')).toBeNull();expect(screen.getByText('old.grc')).toBeInTheDocument();
});
